pragma solidity 0.4.24;

import "./FaucetToken.sol";

/**
 * @title Generic Token example that anybody can mint by calling the mint function.
 */
contract GenericERC20TokenB is FaucetToken {

    string public constant name = "GenericERC20TokenB";
    string public constant symbol = "GET20B";
    uint8 public constant decimals = FAUCET_DECIMALS;

}
