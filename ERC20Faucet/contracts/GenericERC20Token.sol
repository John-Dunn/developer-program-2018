pragma solidity ^0.4.24;

import "./FaucetToken.sol";

/**
 * @title Generic Token example that anybody can mint by calling the mint function with some ETH. The same amount of this token is then minted and assigned to the sender.
 */
contract GenericERC20Token is FaucetToken {

    string public constant name = "GenericERC20Token";
    string public constant symbol = "GET20";
    uint8 public constant decimals = 18;

}
