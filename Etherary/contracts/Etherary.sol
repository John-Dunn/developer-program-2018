pragma solidity 0.4.24;

// TODO: import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol"; for safeTransfer

/// @dev Provides ERC721 contract ionterface for querying ownership and manipulating approval status
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";

/// @title Etherary trustless exchange of ERC721 token
// Terminology:
//  - Trade: Struct where one party offers something and specifies what it wants in return, e.g.
//           I offer token 2 of contract A and want token 3 of the same contract in exchange.
//  - Maker: Creator of the trade
//  - Maker token: Token the maker wants to trade away
//  - Taker: Party that completes a trade, receiving the maker token, giving away the taker token
//  - Taker token: Token the taker has that the maker wants

contract Etherary {
    /// @dev Magic numbers for the xor-ed hashes of the interface
    /// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721Basic.sol
    /// Used for checking whether the provided ERC721 contract implements the neccessary
    /// functions. See EIP165
    bytes4 private constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 private constant InterfaceId_ERC721Exists = 0x4f558e79;

    mapping (uint256 => Trade) public idToTrade;

    // Increasing counter of trade IDs
    uint256 public tradeId = 0;

    // Do this later as part of an trade?
    // enum AssetType { ETHER, ERC20, ERC721 }
    // TODO: event arguments should start with underscores
    event TradeCreated (
        address _tokenContract,
        uint256 _makerTokenId,
        uint256 _takerTokenId,
        uint256 _tradeId
    );

    event TradeCancelled (
        uint256 _tradeId
    );

    event TradeFilled (
        uint256 _tradeId
    );

    struct Trade {
        //AssetType assetType;
        address maker;
        address taker;
        address tokenContract;
        uint256 makerTokenId; /// @dev only used for ERC721
        uint256 takerTokenId; /// @dev only used for ERC721
        bool isActive;
    }

    modifier onlyMaker(uint256 _tradeId) {
        require(
            idToTrade[_tradeId].maker == msg.sender,
            "Only the maker of the trade can call this function.");
        _;
    }

    modifier deactivatesTrade(uint256 _tradeId) {
        Trade storage trade = idToTrade[_tradeId];
        require(trade.isActive, "This function can only be called when the trade is active.");
        _;
        trade.isActive = false;
    }

    /// @notice This contract must be an approved withdrawer for the maker token
    function createERC721Trade(
        address _tokenContractAddress,
        uint256 _makerTokenId,
        uint256 _takerTokenId
    )
        public
    {
        ERC721Basic tokenContract = ERC721Basic(_tokenContractAddress);
        //TODO: token ids should be different
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721),
            "Provided contract must support the ERC721 interface."
        );
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721Exists),
            "Provided contract must support the ERC721 exists function."
        );
        require(tokenContract.exists(_makerTokenId), "Maker token does not exist.");
        require(tokenContract.exists(_takerTokenId), "Taker token does not exist.");
        require(
            callerOwnsTokenAndHasApproved(tokenContract, _makerTokenId),
            "Maker must own the token and have approved this contract."
        );

        tokenContract.transferFrom(msg.sender, address(this), _makerTokenId);
        Trade memory trade = Trade({
            maker: msg.sender,
            taker: 0x0000000000000000000000000000000000000000,
            tokenContract: _tokenContractAddress,
            makerTokenId: _makerTokenId,
            takerTokenId: _takerTokenId,
            isActive: true
        });

        idToTrade[tradeId] = trade;
        emit TradeCreated(_tokenContractAddress, _makerTokenId, _takerTokenId, tradeId);
        tradeId++;
    }

    function fillERC721Trade(uint256 _tradeId)
        public
        deactivatesTrade(_tradeId)
    {
        Trade storage trade = idToTrade[_tradeId];

        ERC721Basic tokenContract = ERC721Basic(trade.tokenContract);
        require(
            callerOwnsTokenAndHasApproved(tokenContract, trade.takerTokenId),
            "Taker must own the token and have approved this contract."
        );
        tokenContract.transferFrom(msg.sender, address(this), trade.takerTokenId);
        tokenContract.approve(msg.sender, trade.makerTokenId);
        tokenContract.approve(trade.maker, trade.takerTokenId);
        trade.taker = msg.sender;
        emit TradeFilled(_tradeId);
    }

    function cancelERC721Trade(uint256 _tradeId)
        public
        onlyMaker(_tradeId)
        deactivatesTrade(_tradeId)
    {
        Trade storage trade = idToTrade[_tradeId];

        ERC721Basic tokenContract = ERC721Basic(trade.tokenContract);
        assert(tokenContract.ownerOf(trade.makerTokenId) == address(this));
        tokenContract.approve(msg.sender, trade.makerTokenId);

        emit TradeCancelled(_tradeId);
    }

    function callerOwnsTokenAndHasApproved(ERC721Basic _tokenContract, uint256 _tokenId)
        private
        returns (bool)
    {
        bool callerOwnsToken = _tokenContract.ownerOf(_tokenId) == msg.sender;
        bool callerHasApproved = _tokenContract.getApproved(_tokenId) == address(this);
        return callerOwnsToken && callerHasApproved;
    }

}
