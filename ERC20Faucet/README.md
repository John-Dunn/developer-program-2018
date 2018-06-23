# ERC20 Token Faucet
This offers an easy way to get ERC20 token on testnets. Simply call the payable function `mint` with some ETH and receive the same amount of the Generic ERC20 Token (GERCT).

### Development:
This is a modified version of OpenZeppelin's `MintableToken`. Requires the OpenZeppelin `StandardToken`, which should be included via ethpm and `truffle install`. A series of tests are included in the `test` folder and can be run via `truffle test`.
