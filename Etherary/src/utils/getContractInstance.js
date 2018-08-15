var truffleContract = require("truffle-contract");

export function getContractInstance (contract, web3) {
    var contractAddress = contract.networks[web3.version.network].address;

    var tcontract = truffleContract(contract);
    tcontract.setProvider(web3.currentProvider)
    return tcontract.at(contractAddress);
}

export function instantiateContractAt (contract, web3, address) {
    var tcontract = truffleContract(contract);
    tcontract.setProvider(web3.currentProvider)
    return tcontract.at(address);
}
