pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

/**
 * @title Faucet Token
 * @dev Simple ERC20 Token example which can serve as a faucet. Allows anybody to request some token
 * Based on the MintableToken by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol
 */
contract FaucetToken is StandardToken {
    event Mint(address indexed to, uint256 amount);

    uint256 constant private PRE_DECIMAL_VALUE = 100;
    uint8 constant internal FAUCET_DECIMALS = 18;
    uint256 constant public AMOUNT_TO_MINT = PRE_DECIMAL_VALUE*10**uint256(FAUCET_DECIMALS);

    /**
    * @dev Function to mint token and transfer them to the message sender.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint() public returns (bool) {
        return mint(msg.sender);
    }

    /**
    * @dev Function to dispense token to a specified recipient.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint(address _to) public returns (bool) {
        totalSupply_ = totalSupply_.add(AMOUNT_TO_MINT);
        balances[_to] = balances[_to].add(AMOUNT_TO_MINT);
        emit Mint(_to, AMOUNT_TO_MINT);
        emit Transfer(address(0), _to, AMOUNT_TO_MINT);
        return true;
    }


}
