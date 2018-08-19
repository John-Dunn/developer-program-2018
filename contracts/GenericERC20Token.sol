pragma solidity ^0.4.24;

import "./FaucetToken.sol";

/**
 * @title Generic Token example that anybody can mint by calling the mint function.
 */
contract GenericERC20Token is FaucetToken {

    string public constant name = "GenericERC20Token";
    string public constant symbol = "GET20";
    uint8 public constant decimals = FAUCET_DECIMALS;

}
