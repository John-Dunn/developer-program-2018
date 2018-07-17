pragma solidity 0.4.24;

// TODO: import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol"; for safeTransfer

import "./ERC721Basic.sol"; /// @dev Provides Interface for querying approval status

/// @title Etherary trustless exchange of ERC721 token
contract Etherary {
    // Magix numbers for the xor-ed hashes of the interface https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721Basic.sol

    /// @dev Used for checking whether the provided ERC721 contract implements the neccessary
    /// functions. These are private in ERC721Token.sol but could be imported in a better way
    bytes4 private constant InterfaceId_ERC721 = 0x80ac58cd;
    bytes4 private constant InterfaceId_ERC721Exists = 0x4f558e79;

    mapping (address => uint256[]) public sellerToOrders;
    mapping (uint256 => SellOrder) public idToSellOrder;

    // Do this later as part of an order?
    // enum AssetType { ETHER, ERC20, ERC721 }

    struct SellOrder {
        //AssetType assetType;
        address tokenContract;
        uint256 tokenId; /// @dev only used for ERC721
    }

    // Check whether the contract implements the necessary functions.
    // TODO: check whether this is not better tested within the function and not a modifier
    modifier validERC721Contract(address _contractAddress) {
        ERC721Basic tokenContract = ERC721Basic(_contractAddress);
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721),
            "Provided contract must support the ERC721 interface."
        );
        require(
            tokenContract.supportsInterface(InterfaceId_ERC721Exists),
            "Provided contract must support the ERC721 exists function."
        );
        _;
    }

    // Check whether the token exists.
    // TODO: check whether this is not better tested within the function and not a modifier
    modifier existingERC721Token(address _contractAddress, uint256 _tokenId) {
        ERC721Basic tokenContract = ERC721Basic(_contractAddress);
        require(
            tokenContract.exists(_tokenId),
            "Token ID does not exist."
        );
        _;
    }

    // This contract must be an approved withdrawer for the token to sell
    function createERC721SellOrder(
        address _tokenContractAddress,
        uint256 _tokenToSell,
        uint256 _tokenToAccept
    )
        public
        validERC721Contract(_tokenContractAddress)
        existingERC721Token(_tokenContractAddress, _tokenToSell)
        existingERC721Token(_tokenContractAddress, _tokenToAccept)
        withdrawalAllowed(_tokenContractAddress, _tokenToSell)
    {
        ERC721Basic tokenContract = ERC721Basic(_tokenContractAddress);
        require(
            tokenContract.getApproved(_tokenToSell) == address(this),
            "Not authorized to withdraw token for sale."
        );
    }

}
