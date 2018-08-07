import Web3 from 'web3'


let getContractInstance = function(web3, abi, address) {
    var contract = web3.eth.contract(abi);
    return contract.at(address)
}

let getContractAddress = function (web3, contract) {
    return contract.networks[web3.version.network].address;
}


export default {getContractInstance, getContractAddress}
