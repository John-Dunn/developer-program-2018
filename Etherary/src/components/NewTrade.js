import React, { Component } from 'react'
import ERC721abi from '../resources/ERC721BasicABI.json'
import Etherary from '../../build/contracts/Etherary.json'

class NewTrade extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Step 1
            tokenContract: null,
            validContractAndTokenOwned: false,
            tokenSellId: null,

            // Step 2
            tokenBuyId: null,
            tokenBuyIdExists: false,

            // Step 3
            withdrawalApproved: false
        }

        // Step 1
        this.handleTokenContractChange = this.handleTokenContractChange.bind(this);
        this.handleTokenSellIdChange = this.handleTokenSellIdChange.bind(this);
        this.handleCheckOwnership = this.handleCheckOwnership.bind(this);

        // Stop 2
        this.handleTokenBuyIdChange = this.handleTokenBuyIdChange.bind(this);
        this.handleCheckExistence = this.handleCheckExistence.bind(this);

        // Step 3
        this.handleApproval = this.handleApproval.bind(this);
    }






    // Handlers for Step 1
    handleTokenContractChange(event) {
        this.setState({
            tokenContract: event.target.value,
            validContractAndTokenOwned: false,
            tokenBuyIdExists: false

        });
    }

    handleTokenSellIdChange(event) {
      this.setState({
          tokenSellId: event.target.value,
          validContractAndTokenOwned: false,
      });
    }

    handleCheckOwnership(event) {
        var ERC721Token = this.props.web3.eth.contract(ERC721abi);
        try {
            var ERC721Instance = ERC721Token.at(this.state.tokenContract);
            var owner = ERC721Instance.ownerOf(this.state.tokenSellId);
            if(owner === this.props.web3.eth.accounts[0]) {
                this.setState({validContractAndTokenOwned: true});
            }
        } catch(e) {
            console.log("Checking ownership failed: ", e);
        }

        event.preventDefault();
    }

    // Util for step 1
    ownershipButtonDisabled() {
        return (!this.props.web3.isAddress(this.state.tokenContract) || this.state.tokenSellId == null);
    }

    stepOne() {
        return (
            <div>
            <h3> 1. Specify token to trade away</h3>
            <form className="pure-form">
                <fieldset>
                    <legend>Specify a valid ERC721 contract address which handles the token you want to trade, as well as the token ID.</legend>
                    <label> {"Contract: "}
                        <input
                            className="pure-u-1-2"
                            type="text"
                            placeholder="0xba1..."
                            name="contractAddress"
                            onChange={this.handleTokenContractChange}
                        />
                    </label>

                    <label> {"Token ID: "}
                    <input
                        className="pure-u-1-8"
                        type="number"
                        placeholder="123"
                        name="tokenSellId"
                        onChange={this.handleTokenSellIdChange}
                    />
                    </label>

                    <button
                        disabled={this.ownershipButtonDisabled()}
                        className="pure-button pure-button-primary"
                        onClick={this.handleCheckOwnership}
                    >
                            Check Ownership
                    </button>
                </fieldset>
            </form>
            <div> The address is {this.props.web3.isAddress(this.state.tokenContract) ? 'valid' : 'invalid'}. Ownership: {this.state.validContractAndTokenOwned ? 'True' : 'False'}</div>
            </div>
        );
    }





    // Step 2
    handleTokenBuyIdChange(event) {
      this.setState({
          tokenBuyId: event.target.value,
          tokenBuyIdExists: false
      });
    }

    handleCheckExistence(event) {
        var ERC721Token = this.props.web3.eth.contract(ERC721abi);
        try {
            var ERC721Instance = ERC721Token.at(this.state.tokenContract);
            if(ERC721Instance.exists(this.state.tokenBuyId)) {
                this.setState({tokenBuyIdExists: true});
            }
        } catch(e) {
            console.log("Checking existence failed: ", e);
        }

        event.preventDefault();
    }

    // Util for step 1
    existenceButtonDisabled() {
        return (!this.props.web3.isAddress(this.state.tokenContract) || this.state.tokenBuyId == null);
    }

    stepTwo() {
        return (
            <div>
            <h3> 2. Which token do you want? </h3>
            <form className="pure-form">
                <fieldset>
                    <legend>Specify the token ID of the token you want. It should be of the same kind as the one you are trading away (i.e. same contract address) and should exist.</legend>
                    <label> {"Token ID: "}
                        <input
                            className="pure-u-1-8"
                            type="number"
                            placeholder="123"
                            name="tokenBuyId"
                            onChange={this.handleTokenBuyIdChange}
                        />
                    </label>

                    <button
                        disabled={this.existenceButtonDisabled()}
                        className="pure-button pure-button-primary"
                        onClick={this.handleCheckExistence}
                    >
                            Check Existence
                    </button>
                </fieldset>
            </form>
            <div> Token exists: {this.state.tokenBuyIdExists? 'true' : 'false'} </div>
            </div>
        )
    }






    // Step 3
    handleApproval(event) {
        var ERC721Token = this.props.web3.eth.contract(ERC721abi);
        try {
            var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
            var ERC721Instance = ERC721Token.at(this.state.tokenContract);
            ERC721Instance.approve(etheraryAddress, this.state.tokenSellId, {from: this.props.web3.eth.accounts[0]})

            var approvalEvent = ERC721Instance.Approval({_owner: this.props.web3.eth.accounts[0]})

            approvalEvent.watch(function(error, log){
                if (!error) {
                    this.setState({
                        withdrawalApproved: true
                    })
                    approvalEvent.stopWatching();
                    console.log('Token approved');
                } else {
                console.log('Error watching for approval events: ', error);
                }
            }.bind(this));

        } catch(e) {
            console.log("Approval failed: ", e);
        }

        event.preventDefault();
    }

    // Util for step 3
    approvalButtonDisabled() {
        return !(this.state.validContractAndTokenOwned && this.state.tokenBuyIdExists);
    }

    createButtonDisabled() {
        return this.approvalButtonDisabled() || !this.state.withdrawalApproved;
    }


    stepThree() {
        return (
            <div>
            <h3> 3. Create the trade </h3>
            <form className="pure-form">
                <fieldset>
                    <legend>Good to go! Keep in mind we need your approval to withdraw your token before the trade can be created.</legend>

                    <button
                        disabled={this.approvalButtonDisabled()}
                        className="pure-button pure-button-primary"
                        onClick={this.handleApproval}
                    >
                        Approve
                    </button>

                    <button
                        disabled={this.createButtonDisabled()}
                        className="pure-button pure-button-primary"
                    >
                        Create Trade
                    </button>

                </fieldset>
            </form>
            </div>
        )
    }


    render() {
        if(!this.props.web3Connected) {
            return (
                <div> Please establish web3 connection </div>
            )
        }
        return (
            <div>
                <h2> You can create a new trade!</h2>
                <p> There are three steps to creating a new trade: </p>
                {this.stepOne()}
                {this.stepTwo()}
                {this.stepThree()}
            </div>
        );
    }
}

export default NewTrade
