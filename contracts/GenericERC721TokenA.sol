pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";


contract GenericERC721TokenA is ERC721Token {

    string private name = "GenericERC721TokenA";
    string private symbol = "GET721A";

    constructor() public ERC721Token(name, symbol) {}

    function mint() public {
        mint(msg.sender);
    }

    function mint(address _recipient) public {
        uint256 newTokenId = totalSupply();
        _mint(_recipient, newTokenId);
    }

}
