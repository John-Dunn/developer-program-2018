pragma solidity 0.4.24;

/// @dev Used for circuit breaker
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./WrappedToken.sol";

/// @title Etherary trustless exchange of ERC721 token
// Terminology:
//  - Trade: Struct where one party offers something and specifies what it wants in return, e.g.
//           I offer token 2 of contract A and want token 3 of the same contract in exchange.
//  - Maker: Creator of the trade
//  - Maker token: Token the maker wants to trade away
//  - Taker: Party that completes a trade, receiving the maker token, giving away the taker token
//  - Taker token: Token the taker has that the maker wants

contract Etherary is Ownable, WrappedToken {

    mapping (uint256 => Trade) public idToTrade;

    // Increasing counter of trade IDs
    uint256 public tradeId = 0;

    /// @dev in case something goes wrong this variable is set to true and all trades will no
    /// longer be fillable, only cancelling and withdrawing is allowed then
    bool private stopped = false;

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

    // Modifier
    modifier stopsInEmergency() {
        require(!stopped, "This function cannot be called, contract stopped");
        _;
    }

    modifier onlyMaker(uint256 _tradeId) {
        require(
            idToTrade[_tradeId].maker == msg.sender,
            "Only the maker of the trade can call this function."
        );
        _;
    }

    modifier deactivatesTrade(uint256 _tradeId) {
        Trade storage trade = idToTrade[_tradeId];
        require(trade.isActive, "This function can only be called when the trade is active.");
        _;
        trade.isActive = false;
    }

    function toggleContractActive() public onlyOwner {
        stopped = !stopped;
        if (stopped) {emit ContractStopped();}
        if (!stopped) {emit ContractResumed();}
    }

    /// @notice This contract must be an approved withdrawer for the maker token
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
    {
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

    function cancelTrade(uint256 _tradeId)
        public
        onlyMaker(_tradeId)
        deactivatesTrade(_tradeId)
    {
        Trade storage trade = idToTrade[_tradeId];

        approve(
            trade.makerTokenContract,
            trade.isTakerContractERC20,
            msg.sender,
            trade.makerTokenIdOrAmount
        );

        emit TradeCancelled(_tradeId);
    }



    function fillTrade(uint256 _tradeId)
        public
        deactivatesTrade(_tradeId)
        stopsInEmergency
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
            trade.takerTokenIdOrAmount
        );

        approve(
            trade.makerTokenContract,
            trade.isMakerContractERC20,
            msg.sender,
            trade.makerTokenIdOrAmount
        );

        trade.taker = msg.sender;
        emit TradeCompleted(_tradeId);
    }

}
