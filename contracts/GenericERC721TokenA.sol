pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

/**
 * @title Generic Token example that anybody can mint by calling the mint function.
 */
contract GenericERC721TokenA is ERC721Token {

    string private name = "GenericERC721TokenA";
    string private symbol = "GET721A";

    constructor() public ERC721Token(name, symbol) {}

    /**
    * @dev Function to mint token and transfer them to the message sender.
    */
    function mint() public {
        mint(msg.sender);
    }

    /**
    * @dev Function to mint token and transfer them to provided address.
    */
    function mint(address _recipient) public {
        uint256 newTokenId = totalSupply();
        _mint(_recipient, newTokenId);
    }

}
