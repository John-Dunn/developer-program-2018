# ERC20 Token Faucet
An easily accessible faucet for ERC20 token with the goal of providing ERC20 token on testnets to play around with.

#### Use:
The contract has been deployed on the Rinkeby testnet and can be found under the address `0xe6fcAC0f0A5496A7D2Ffa158e6FFeDCc910dEAcD` or [here on Etherscan](https://rinkeby.etherscan.io/address/0xe6fcAC0f0A5496A7D2Ffa158e6FFeDCc910dEAcD). To receive 100 Generic ERC20 Token (GET20), call the `mint()` function to receive them yourself, or call `mint(address _to)` to supply some other address.

#### Development:
Run `truffle install` and `npm install`.

This is a modified version of OpenZeppelin's `MintableToken`. Requires the OpenZeppelin `StandardToken`, which is included via ethpm by running `truffle install`. Additionally, for migration to a testnet Infura is used which requires the `truffle-hdwallet-provider` per npm.

Migration to Rinkeby is done by running `truffle migrate --network rinkeby`. This requires an an Infura token and the mnemonic of the contract creator. This must be specified in `accounts.js` in the root directory of this repository and should look like this:

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
