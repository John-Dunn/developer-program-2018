import React, { Component } from 'react'
import ERC721abi from '../resources/ERC721BasicABI.json'
import EtheraryContract from '../../build/contracts/Etherary.json'
import watchForEvent from '../utils/watchForEvent'

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
            withdrawalApproved: false,
            tradeCreated: false,
            orderId: -1
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
        this.handleCreateTrade = this.handleCreateTrade.bind(this);

    }

    // EXTRACT:
    instantiate(web3, abi, address) {
        var contract = web3.eth.contract(abi);
        return contract.at(address)
    }

    contractAddress(web3, contract) {
        return contract.networks[web3.version.network].address;
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
        var ERC721Instance = this.instantiate(this.props.web3, ERC721abi, this.state.tokenContract)
        try {
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
        var ERC721Instance = this.instantiate(this.props.web3, ERC721abi, this.state.tokenContract)
        try {
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
    handleCreateTrade(event) {
        var etheraryAddress = this.contractAddress(this.props.web3, EtheraryContract);
        var EtheraryInstance = this.instantiate(this.props.web3, EtheraryContract.abi, etheraryAddress)

        EtheraryInstance.createERC721SellOrder(
            this.state.tokenContract,
            this.state.tokenSellId,
            this.state.tokenBuyId,
            {from: this.props.web3.eth.accounts[0], gas:500000}
        );

        var creationEvent = EtheraryInstance.SellOrderCreated({
            tokenContract: this.state.tokenContract,
            tokenForSale: this.state.tokenSellId,
            tokenWanted: this.state.tokenBuyId
        })

        watchForEvent(creationEvent)
        .then(results => {
            this.setState({
                orderId: results.args.orderId.toNumber(),
                tradeCreated: true,
            })
            console.log('Trade created with id ', results.args.orderId.toNumber());
        })
        .catch(function(error) {
            console.log('Error watching for approval events: ', error);
        });

        event.preventDefault();
    }

    handleApproval(event) {
        var ERC721Instance = this.instantiate(this.props.web3, ERC721abi, this.state.tokenContract)

        var etheraryAddress = this.contractAddress(this.props.web3, EtheraryContract);
        ERC721Instance.approve(etheraryAddress, this.state.tokenSellId, {from: this.props.web3.eth.accounts[0]})

        var approvalEvent = ERC721Instance.Approval({
            _owner: this.props.web3.eth.accounts[0],
            _approved: etheraryAddress,
            _tokenId: this.state.tokenSellId
        })

        watchForEvent(approvalEvent)
        .then(results => {
            this.setState({
                withdrawalApproved: true
            })
            console.log('Token approved');
        })
        .catch(function(error) {
            console.log('Error watching for approval events: ', error);
        });

        event.preventDefault();
    }

    // Util for step 3
    approvalButtonDisabled() {
        return !(this.state.validContractAndTokenOwned && this.state.tokenBuyIdExists);
    }

    createButtonDisabled() {
        return this.approvalButtonDisabled() || !this.state.withdrawalApproved;
    }

    tradeCreatedMessage() {
        if (!this.state.tradeCreated) {
            return (<p></p>);
        } else {
            return(
                <p>Trade successfully created! Trade id: <strong>{this.state.orderId}</strong>.</p>
            )
        }
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
                        onClick={this.handleCreateTrade}
                    >
                        Create Trade
                    </button>

                </fieldset>
            </form>
            {this.tradeCreatedMessage()}
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
