pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


contract GenericERC721TokenB is ERC721Token {

    string private name = "GenericERC721TokenB";
    string private symbol = "GET721B";

    constructor() public ERC721Token(name, symbol) {}

    function mint() public {
        mint(msg.sender);
    }

    function mint(address _recipient) public {
        uint256 newTokenId = totalSupply();
        _mint(_recipient, newTokenId);
    }

}
