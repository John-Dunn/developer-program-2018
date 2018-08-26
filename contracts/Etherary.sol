pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./TokenInterface.sol";

/// @title Etherary - trustless exchange of ERC721 and ERC20 token
// Allows the creation of trades by specifying an ERC20 or ERC721 contract, token on that contracts
// (that the caller owns), as well as ERC20 or ERC721 contract and a token on that contract that
// the caller wants. The trade maker's token is then withdrawn to this contract. Once
// somebody fills that trade, the taker's token is withdrawn as well and the participants are
// approved to withdraw each other's token.
//
// Terminology:
//  - Trade: Struct where one party offers something and specifies what it wants in return, e.g.
//           I offer token 2 of ERC721 contract A and want 20 token from ERC20 contract in
//           exchange.
//  - Maker: Creator of the trade
//  - Maker token: Token the maker wants to trade away
//  - Taker: Party that completes a trade, receiving the maker token, giving away the taker token
//  - Taker token: Token the taker has that the maker wants

contract Etherary is Ownable, TokenInterface {

    mapping (uint256 => Trade) public idToTrade;

    // Increasing counter of trade IDs
    uint256 public tradeId = 0;

    /// @dev in case something goes wrong this variable is set to true and trades will no
    /// longer be creatablel or fillable, only cancelling and withdrawing is allowed then
    bool private stopped = false;

    /// @dev Mutex variable preventing reentrancy
    bool locked = false;

    event TradeCreated (
        address _makerTokenContract,
        uint256 _makerTokenIdOrAmount,
        address _takerTokenContract,
        uint256 _takerTokenIdOrAmount,
        uint256 _tradeId
    );
    event TradeCancelled (uint256 _tradeId);
    event TradeCompleted (uint256 _tradeId);

    event ContractStopped();
    event ContractResumed();

    struct Trade {
        bool isMakerContractERC20; // If false, ERC721
        bool isTakerContractERC20; // If false, ERC721
        address maker;
        address taker;
        address makerTokenContract;
        address takerTokenContract;
        uint256 makerTokenIdOrAmount;
        uint256 takerTokenIdOrAmount;
        bool isActive;
    }

    /// @dev Disallows creating and completing a trade if contract is stopped
    modifier stopsInEmergency() {
        require(!stopped, "This function cannot be called, contract stopped");
        _;
    }

    /// @dev Prevents reentrancy
    modifier locks() {
        require(!locked, "This function cannot be called when locked");
        locked = true;
        _;
        locked = false;
    }


    /** @dev Only the creator of the trade is allowed to call this function
      * @param _tradeId ID of the trade this function operates on
      */
    modifier onlyMaker(uint256 _tradeId) {
        require(
            idToTrade[_tradeId].maker == msg.sender,
            "Only the maker of the trade can call this function."
        );
        _;
    }

    /** @dev Functions may only operate on active trades and render them inactive
      * @param _tradeId ID of the trade this function operates on
      */
    modifier deactivatesTrade(uint256 _tradeId) {
        Trade storage trade = idToTrade[_tradeId];
        require(trade.isActive, "This function can only be called when the trade is active.");
        _;
        trade.isActive = false;
    }

    /// @dev Allows owner to stop the contract in case of unexpected behaviour
    function toggleContractActive() public onlyOwner {
        stopped = !stopped;
        if (stopped) {emit ContractStopped();}
        if (!stopped) {emit ContractResumed();}
    }

    /** @dev Check whether the ERC20 token amount is nonzero (prevents creation of uncancellable
      * trades)
      * @param isERC20 Whether 0 is allowed or not
      * @param amount Trade amount
      */
    function validTokenIdOrAmount(bool isERC20, uint256 amount) private returns (bool) {
        return isERC20 ? amount > 0 : true;
    }

    /** @dev Create a new trade, withdraw the maker token
      * @param _makerTokenContract Contract address of the maker token (can be ERC20 or ERC721)
      * @param _isMakerERC20 Whether contract above is ERC20 (true) or ERC721 (false)
      * @param _makerTokenIdOrAmount ID of the maker token (ERC721) or amount (ERC721)
      * @param _takerTokenContract As with maker
      * @param _isTakerERC20 As with maker
      * @param _takerTokenIdOrAmount As with maker
      *
      * @notice This contract must be an approved withdrawer for the maker token
      */
    function createTrade(
        address _makerTokenContract,
        bool _isMakerERC20,
        uint256 _makerTokenIdOrAmount,
        address _takerTokenContract,
        bool _isTakerERC20,
        uint256 _takerTokenIdOrAmount
    )
        public
        stopsInEmergency
        locks
    {
        require(
            validTokenIdOrAmount(_isMakerERC20, _makerTokenIdOrAmount), "ERC20 amount cannot be 0"
        );

        require(
            validTokenIdOrAmount(_isTakerERC20, _takerTokenIdOrAmount), "ERC20 amount cannot be 0"
        );

        require(
            isOwned(_makerTokenContract, _isMakerERC20, msg.sender, _makerTokenIdOrAmount),
            "Caller must own the maker token"
        );

        require(
            isApproved(
                _makerTokenContract,
                _isMakerERC20,
                msg.sender,
                address(this),
                _makerTokenIdOrAmount
            ),
            "This contract must be an approved spender of the maker token"
        );

        transferFrom(
            _makerTokenContract,
            _isMakerERC20,
            msg.sender,
            address(this),
            _makerTokenIdOrAmount
        );

        Trade memory trade = Trade({
            isMakerContractERC20: _isMakerERC20,
            isTakerContractERC20: _isTakerERC20,
            maker: msg.sender,
            taker: 0,
            makerTokenContract: _makerTokenContract,
            takerTokenContract: _takerTokenContract,
            makerTokenIdOrAmount: _makerTokenIdOrAmount,
            takerTokenIdOrAmount: _takerTokenIdOrAmount,
            isActive: true
        });

        idToTrade[tradeId] = trade;
        emit TradeCreated(
            _makerTokenContract,
            _makerTokenIdOrAmount,
            _takerTokenContract,
            _takerTokenIdOrAmount,
            tradeId
        );
        tradeId++;
    }

    /** @dev Cancel an existing trade, approving the maker to withdraw the maker token
      * @param _tradeId Trade id to be cancelled
      *
      * @notice Token is not transferred yet, owner must call the token contract's transfer himself
      */
    function cancelTrade(uint256 _tradeId)
        public
        onlyMaker(_tradeId)
        deactivatesTrade(_tradeId)
        locks
    {
        Trade storage trade = idToTrade[_tradeId];

        approve(
            trade.makerTokenContract,
            trade.isMakerContractERC20,
            msg.sender,
            trade.makerTokenIdOrAmount,
            address(this)
        );

        emit TradeCancelled(_tradeId);
    }

    /** @dev Complete an existing trade, approving the maker to withdraw the takler token and the
      *      taker to withdraw the maker token.
      * @param _tradeId Trade id to be completed
      *
      * @notice Token are not transferred yet, owners must call the token contract's transfer
      *         themselves
      */
    function fillTrade(uint256 _tradeId)
        public
        deactivatesTrade(_tradeId)
        stopsInEmergency
        locks
    {
        Trade storage trade = idToTrade[_tradeId];

        require(
            isOwned(
                trade.takerTokenContract,
                trade.isTakerContractERC20,
                msg.sender,
                trade.takerTokenIdOrAmount
            ),
            "Caller must own the taker token."
        );
        require(
            isApproved(
                trade.takerTokenContract,
                trade.isTakerContractERC20,
                msg.sender,
                address(this),
                trade.takerTokenIdOrAmount
            ),
            "This contract must be an approved spender of the taker token"
        );

        transferFrom(
            trade.takerTokenContract,
            trade.isTakerContractERC20,
            msg.sender,
            address(this),
            trade.takerTokenIdOrAmount
        );
        approve(
            trade.takerTokenContract,
            trade.isTakerContractERC20,
            trade.maker,
            trade.takerTokenIdOrAmount,
            address(this)
        );

        approve(
            trade.makerTokenContract,
            trade.isMakerContractERC20,
            msg.sender,
            trade.makerTokenIdOrAmount,
            address(this)
        );

        trade.taker = msg.sender;
        emit TradeCompleted(_tradeId);
    }

}
