import React, { Component } from 'react'
import ERC721Faucet from '../../../ERC721Faucet/build/contracts/GenericERC721Token.json'

class Testing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faucetInstance: null,
            faucetAddress: null,
            account: null,

            balance: -1,
            mintingSuccessful: false,
            latestMintedToken: -1
        }
        this.handleMint = this.handleMint.bind(this);
    }

    componentDidMount() {
        this.instantiateContract();
    }

    componentDidUpdate() {
        this.instantiateContract();
    }

    instantiateContract() {
        if(this.props.web3Connected == true && this.state.faucetInstance === null) {
            var faucetAddress = ERC721Faucet.networks[this.props.web3.version.network].address;
            var faucet = this.props.web3.eth.contract(ERC721Faucet.abi);
            var faucetInstance = faucet.at(faucetAddress);
            var account = this.props.web3.eth.accounts[0];
            var balance = faucetInstance.balanceOf(account, {from:account}).toNumber()

            this.setState({
                faucetInstance: faucetInstance,
                faucetAddress: faucetAddress,
                account: account,
                balance: balance
            })
        }
    }


    handleMint(event) {
        this.setState({
            mintingSuccessful: false
        })

        try {
            var accountAddress = this.state.account;
            var mintData = this.state.faucetInstance.mint.getData({from:accountAddress});
            var gasEstimate = this.props.web3.eth.estimateGas({
                to: this.state.faucetAddress,
                data: mintData
            });
            this.state.faucetInstance.mint({from:accountAddress, gas: gasEstimate});
            this.listenToTransfer();
            this.setState({
                balance: this.state.faucetInstance.balanceOf(accountAddress, {from:accountAddress}).toNumber()
            })
        } catch(e) {
            console.log("Minting failed: ", e);
        }
        event.preventDefault();
    }



    listenToTransfer() {
        var transferEvent = this.state.faucetInstance.Transfer({_to: this.state.account})
        transferEvent.watch(function(error, log){
            if (!error) {
                var mintedTokenId = log.args._tokenId.toNumber();
                this.setState({
                    mintingSuccessful: true,
                    latestMintedToken: mintedTokenId
                })
                transferEvent.stopWatching();
                console.log('Token minting successful. Token Id: ', mintedTokenId);
            } else {
            console.log('Error getting minting log: ', error);
            }
        }.bind(this));
    }

    mintMessage() {
        if (!this.state.mintingSuccessful) {
            return (<p> Press mint to receive a token and see your balance</p>);
        } else {
            var balance = this.state.faucetInstance.balanceOf(this.props.web3.eth.accounts[0]);
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
                <h2> Mint a token  for testig purposes</h2>
                <p> A faucet for ERC721 token is deployed at <strong>{this.state.faucetAddress}</strong> where you currently own <strong>{this.state.balance}</strong> token. </p>
                <button
                    className="pure-button pure-button-primary"
                    onClick={this.handleMint}
                >
                    Mint
                </button>
                {this.mintMessage()}
            </div>
        );
    }
}

export default Testing
