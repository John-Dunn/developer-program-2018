All contracts have been deployed to Rinkeby and had their code verified. You can try them on the testnet (remember to approve minted token first).


Migration to Rinkeby was done by running `truffle migrate --network rinkeby`. This requires an an Infura token and the mnemonic of the contract creator. This must be specified in `accounts.js` in the root directory of this repository and should look like this:

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

Unfortunately the UI is not yet ready to work live, but you can interact e.g. via etherscan's read and write tabs. I created several trades that you can look up and fill.

Etherary is [here on etherscan](https://rinkeby.etherscan.io/address/0x05126263a314a32daac14d163f774963f0928ae0)

GenericERC721TokenA is [here on etherscan](https://rinkeby.etherscan.io/address/0xda8f405ffef8b3fa88a4cd3a07415d598f3c0155)

GenericERC721TokenB is [here on etherscan](https://rinkeby.etherscan.io/address/0x2684c79a789ed0e21f178f2a6f87dc017544acf6)

GenericERC20TokenA is [here on etherscan](https://rinkeby.etherscan.io/address/0xf68d922c1c048ec8271a0f49a8f0c8c354f63111)

GenericERC20TokenB is [here on etherscan](https://rinkeby.etherscan.io/address/0x98402f4270e76ce9e5a9bfc5967ef4c2bf35f4ce)
