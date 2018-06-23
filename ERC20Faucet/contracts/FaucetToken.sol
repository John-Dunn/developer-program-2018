pragma solidity ^0.4.24;

import "zeppelin/contracts/token/StandardToken.sol";

/**
 * @title Faucet Token
 * @dev Simple ERC20 Token example which serves as a faucet. Allows anybody to send in ETH in exchange for the same amount of this token.
 * Based on the MintableToken by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol
 */
contract FaucetToken is StandardToken {
    event Mint(address indexed to, uint256 amount);

    /**
    * @dev Function to mint tokens.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint() public payable returns (bool) {
        totalSupply = totalSupply.add(msg.value);
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        emit Mint(msg.sender, msg.value);
        emit Transfer(address(0), msg.sender, msg.value);
        return true;
    }
}
