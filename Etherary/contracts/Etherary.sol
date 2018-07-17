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

    // Increasing counter of order numbers
    uint public orderNumber = 0;

    // Do this later as part of an order?
    // enum AssetType { ETHER, ERC20, ERC721 }

    event SellOrderCreated (
        address tokenContract,
        uint256 tokenForSale,
        uint256 tokenWanted
    );

    struct SellOrder {
        //AssetType assetType;
        address seller;
        address tokenContract;
        uint256 tokenForSale; /// @dev only used for ERC721
        uint256 tokenWanted; /// @dev only used for ERC721
        bool isActive;
    }

    modifier activeOrder(uint256 _orderId) {
        SellOrder memory order = idToSellOrder[_orderId];
        require(order.isActive, "Order is not active.");
        _;
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

        tokenContract.transferFrom(msg.sender, address(this), _tokenForSale);
        SellOrder memory order = SellOrder(
            msg.sender,
            _tokenContractAddress,
            _tokenForSale,
            _tokenWanted,
            true
        );

        idToSellOrder[orderNumber] = order;
        sellerToOrders[msg.sender].push(orderNumber);
        emit SellOrderCreated(_tokenContractAddress, _tokenForSale, _tokenWanted);
        return orderNumber++;
    }

    function fillERC721SellOrder(uint256 _orderId)
        public
        activeOrder(_orderId)
        returns (bool)
    {
        SellOrder memory order = idToSellOrder[_orderId];
        require(order.isActive, "Order is not active.");

        ERC721Basic tokenContract = ERC721Basic(order.tokenContract);
        require(
            tokenContract.getApproved(order.tokenWanted) == address(this),
            "Not authorized to withdraw token for buy."
        );
        tokenContract.transferFrom(msg.sender, address(this), order.tokenWanted);
        tokenContract.approve(msg.sender, order.tokenForSale);
        tokenContract.approve(order.seller, order.tokenWanted);
        return true;
    }

    function cancelERC721SellOrder(uint256 _orderId)
        public
        activeOrder(_orderId)
        returns (bool)
    {
        SellOrder memory order = idToSellOrder[_orderId];
        require(order.seller == msg.sender, "Only order creator can cancel.");

        ERC721Basic tokenContract = ERC721Basic(order.tokenContract);
        assert(tokenContract.ownerOf(order.tokenForSale) == address(this));

        tokenContract.approve(msg.sender, order.tokenForSale);
        return true;
    }

}
