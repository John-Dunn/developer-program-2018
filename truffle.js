//var HDWalletProvider = require("truffle-hdwallet-provider");
//var accounts = require("./accounts.js");
//const rinkebyToken = "https://rinkeby.infura.io/" + accounts.infuraToken();


module.exports = {
  networks: {

    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },

    // rinkeby: {
    //     provider: function() {
    //         return new HDWalletProvider(accounts.rinkebyMnemonic(), rinkebyToken)
    //     },
    //     network_id: 4
    // }

  }
}
