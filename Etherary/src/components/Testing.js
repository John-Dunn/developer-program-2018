import React, { Component } from 'react'
import ERC721Faucet from '../../../ERC721Faucet/build/contracts/GenericERC721Token.json'
import watchForEvent from '../utils/watchForEvent'

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
        var instance = this.state.faucetInstance;
        this.setState({
            mintingSuccessful: false
        })

        var gasEstimate = this.props.web3.eth.estimateGas({
            to: this.state.faucetAddress,
            data: instance.mint.getData({from:this.state.account})
        });

        instance.mint({from:this.state.account, gas: gasEstimate});
        var transferEvent = instance.Transfer({_to: this.state.account});

        watchForEvent(transferEvent)
        .then(results => {
            this.setState({
                balance: instance.balanceOf(this.state.account, {from:this.state.account}).toNumber(),
                latestMintedToken: results.args._tokenId.toNumber(),
                mintingSuccessful: true
            })
        })
        .catch(function(error) {
            console.log(error);
        });

        event.preventDefault();
    }

    mintMessage() {
        if (!this.state.mintingSuccessful) {
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
