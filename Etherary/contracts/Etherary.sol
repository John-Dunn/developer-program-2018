pragma solidity 0.4.24;

// TODO: import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol"; for safeTransfer

/// @dev Provides ERC721 contract ionterface for querying ownership and manipulating approval status
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";

/// @title Etherary trustless exchange of ERC721 token
contract Etherary {
    // Magix numbers for the xor-ed hashes of the interface https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721Basic.sol

    /// @dev Used for checking whether the provided ERC721 contract implements the neccessary
    /// functions. These are private in ERC721Token.sol but could be imported in a better way
    bytes4 private constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 private constant InterfaceId_ERC721Exists = 0x4f558e79;

    mapping (uint256 => SellOrder) public idToSellOrder;
    mapping (address => uint256[]) public sellerToOrders;

    // Increasing counter of order IDs
    uint256 private orderId = 0;

    // Do this later as part of an order?
    // enum AssetType { ETHER, ERC20, ERC721 }
    // TODO: event arguments should start with underscores
    event SellOrderCreated (
        address tokenContract,
        uint256 tokenForSale,
        uint256 tokenWanted,
        uint256 orderId
    );

    event SellOrderCancelled (
        uint256 orderId
    );

    event SellOrderFilled (
        uint256 orderId
    );

    struct SellOrder {
        //AssetType assetType;
        address seller;
        address tokenContract;
        uint256 tokenForSale; /// @dev only used for ERC721
        uint256 tokenWanted; /// @dev only used for ERC721
        bool isActive;
    }

    modifier deactivatesOrder(uint256 _orderId) {
        SellOrder storage order = idToSellOrder[_orderId];
        require(order.isActive, "Order is not active.");
        _;
        order.isActive = false;
    }


    // This contract must be an approved withdrawer for the token to sell
    function createERC721SellOrder(
        address _tokenContractAddress,
        uint256 _tokenForSale,
        uint256 _tokenWanted
    )
        public
        returns (uint256)
    {
        ERC721Basic tokenContract = ERC721Basic(_tokenContractAddress);
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721),
            "Provided contract must support the ERC721 interface."
        );
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721Exists),
            "Provided contract must support the ERC721 exists function."
        );
        require(tokenContract.exists(_tokenForSale), "Token ID does not exist.");
        require(tokenContract.exists(_tokenWanted), "Token ID does not exist.");
        require(
            tokenContract.getApproved(_tokenForSale) == address(this),
            "Not authorized to withdraw token for sale."
        );
        address tokenOwner = tokenContract.ownerOf(_tokenForSale);
        // This below is necessary to avoid people starting auctions for people who were about to
        // start auctions themselves. Alternatively, the sell order creation and token transfer
        // may need to be adjusted.
        require(tokenContract.ownerOf(_tokenForSale) == msg.sender);

        tokenContract.transferFrom(tokenOwner, address(this), _tokenForSale);
        SellOrder memory order = SellOrder(
            msg.sender,
            _tokenContractAddress,
            _tokenForSale,
            _tokenWanted,
            true
        );

        idToSellOrder[orderId] = order;
        sellerToOrders[msg.sender].push(orderId);
        emit SellOrderCreated(_tokenContractAddress, _tokenForSale, _tokenWanted, orderId);
        return orderId++;
    }

    function fillERC721SellOrder(uint256 _orderId)
        public
        deactivatesOrder(_orderId)
    {
        SellOrder memory order = idToSellOrder[_orderId];

        ERC721Basic tokenContract = ERC721Basic(order.tokenContract);
        require(
            tokenContract.getApproved(order.tokenWanted) == address(this),
            "Not authorized to withdraw token for buy."
        );
        tokenContract.transferFrom(msg.sender, address(this), order.tokenWanted);
        tokenContract.approve(msg.sender, order.tokenForSale);
        tokenContract.approve(order.seller, order.tokenWanted);
        emit SellOrderFilled(_orderId);
    }

    function cancelERC721SellOrder(uint256 _orderId)
        public
        deactivatesOrder(_orderId)
    {
        SellOrder storage order = idToSellOrder[_orderId];
        require(order.seller == msg.sender, "Only order creator can cancel.");

        ERC721Basic tokenContract = ERC721Basic(order.tokenContract);
        assert(tokenContract.ownerOf(order.tokenForSale) == address(this));

        tokenContract.approve(msg.sender, order.tokenForSale);

        emit SellOrderCancelled(_orderId);
    }

}
