import React, { Component } from 'react'
import { Button } from 'reactstrap';

var truffleContract = require("truffle-contract");

import ERC721Faucet from '../../../ERC721Faucet/build/contracts/GenericERC721Token.json'
import {getContractInstance} from '../utils/getContractInstance'

import getLogs from '../utils/getLogs'


//Props: web3, web3Connected

class Testing extends Component {
    // Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            faucetInstance: null,
            faucetAddress: null,
            account: null,
            tokenBalance: null,
            justMinted: false,
            latestMintedToken: null
        }
    }

    componentDidMount() {
        if(this.props.web3Connected) {
            this.startup();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.web3 !== prevProps.web3) {
            console.log("Web3 change: ", this.props.web3)
            this.startup();
        }
    }

    startup() {
        var account = this.props.web3.eth.accounts[0];
        this.setState({
            account: account
        });
        var instance = this.instantiateContract();
        instance.balanceOf(account)
        .then(function(result) {
            console.log("Faucet token balance updated: ", result.toNumber());
            this.setState({
                tokenBalance: result.toNumber()
            })
        }.bind(this))
    }

    // Tools
    instantiateContract() {
        var faucetAddress = ERC721Faucet.networks[this.props.web3.version.network].address;
        console.log(getContractInstance)
        var faucetInstance = getContractInstance(ERC721Faucet, this.props.web3);

        this.setState({
            faucetInstance: faucetInstance,
            faucetAddress: faucetAddress
        })
        return faucetInstance;
    }

    // Action handlers
    handleMint() {
        this.setState({
            justMinted: false
        })

        var instance = this.state.faucetInstance;
        var account = this.state.account;
        instance.mint({from:this.state.account})
        // Get minted token number for UI
        .then(function(result) {
            console.log("Minting successful", result);
            var txLogs = getLogs(result);
            this.setState({
                justMinted: true,
                latestMintedToken: txLogs[0].args._tokenId.toNumber()
            })
            // The gas in the following line is to prevent caching
            // see https://github.com/ethereum/web3.js/issues/1463
            return instance.balanceOf.call(account, {gas: 500000+Math.floor(Math.random()*1001)})
        }.bind(this))
        .then(function(result) {
            var balance = result.toNumber();
            console.log("Faucet token balance updated: ", balance);
            this.setState({
                tokenBalance: result.toNumber()
            })
        }.bind(this))
    }


    mintMessage() {
        if (!this.state.justMinted) {
                return (<p></p>);
        } else {
            return(
                <p>Minting successful. You received the token with id <strong>{this.state.latestMintedToken}</strong>.</p>
            )
        }
    }


    render() {
        if(!this.props.web3Connected) {
            return (
                <div> Please establish web3 connection </div>
            )
        }

        return (
            <div>
                <h2> Mint token to play around with</h2>
                <p>
                    A faucet for ERC721 token is deployed at <strong>{this.state.faucetAddress}</strong> where you currently own <strong>{this.state.tokenBalance}</strong> token. Token IDs are given out in order. Feel free to mint as many as you like and play around with the contract.
                </p>
                <div className="centered">
                    <Button color="primary" size="lg" onClick={this.handleMint.bind(this)} >Mint</Button>
                </div>
                {this.mintMessage()}
            </div>
        );
    }
}

export default Testing
