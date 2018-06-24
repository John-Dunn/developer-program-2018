# ERC20 Token Faucet
An easily accessible faucet for ERC20 token with the goal of providing ERC20 token on testnets.

#### Use:
The contract has beed deployed on the Rinkeby testnet and can be found under the address `0x2a1595A3aaAfE463193Fc48854A5E1C52A5B56D3` or [here on Etherscan](https://rinkeby.etherscan.io/address/0x2a1595a3aaafe463193fc48854a5e1c52a5b56d3). Call the payable mint function and send along some ETH and receive the same amount of the Generic ERC20 Token (GERCT).

#### Development:
Run `truffle install` and `npm install`.

This is a modified version of OpenZeppelin's `MintableToken`. Requires the OpenZeppelin `StandardToken`, which is included via ethpm by running `truffle install`. Additionally, for migration to a testnet Infura is used which requires the `truffle-hdwallet-provider` per npm.

Migration to rinkeby is done by running `truffle migrate --network rinkeby`. This requires an an Infura token and the mnemonic of the contract creator. This must be specified in `accounts.js` in the root directory of this repository and should look like this:

```javascript
module.exports = {
   rinkebyMnemonic: function() {
       return "apple pear cherry pineapple coconut banana walnut tomato potato starfruit avocado lime";
   }

   infuraToken: function() {
       return "yourInfuraToken";
   }
}
```

 A series of tests are included in the `test` folder and can be run via `truffle test`.
