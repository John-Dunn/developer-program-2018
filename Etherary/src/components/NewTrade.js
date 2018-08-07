import React, { Component } from 'react'
import ERC721abi from '../resources/ERC721BasicABI.json'
import EtheraryContract from '../../build/contracts/Etherary.json'
import WatchForEvent from '../utils/watchForEvent'
import ContractUtils from '../utils/contractUtils'
import ValidationStatus from '../utils/enums'



import { Form, FormGroup, Label, Input, FormFeedback, FormText, Col, Button} from 'reactstrap';


class NewTrade extends Component {


    constructor(props) {
        super(props);

        this.state = {
            // Step 1
            tokenContract: null,
            validContractAndTokenOwned: ValidationStatus.unchecked,
            tokenSellId: null,

            // Step 2
            tokenBuyId: null,
            tokenBuyIdExists: ValidationStatus.unchecked,

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


    // Handlers for Step 1
    handleTokenContractChange(event) {
        this.setState({
            tokenContract: event.target.value,
            validContractAndTokenOwned: ValidationStatus.unchecked,
            tokenBuyIdExists: ValidationStatus.unchecked,
            withdrawalApproved: false,
            tradeCreated: false
        });
    }

    handleTokenSellIdChange(event) {
      this.setState({
          tokenSellId: event.target.value,
          validContractAndTokenOwned: ValidationStatus.unchecked,
          withdrawalApproved: false,
          tradeCreated: false
      });
    }

    handleCheckOwnership(event) {
        var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, this.state.tokenContract)
        try {
            var owner = ERC721Instance.ownerOf(this.state.tokenSellId);
            if(owner === this.props.web3.eth.accounts[0]) {
                this.setState({validContractAndTokenOwned: ValidationStatus.valid});
            } else {
                this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
            }
        } catch(e) {
            this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
            console.log("Checking ownership failed: ", e);
        }

        event.preventDefault();
    }

    // Util for step 1
    ownershipButtonDisabled() {
        return (!this.props.web3.isAddress(this.state.tokenContract) || this.state.tokenSellId == null);
    }

    stepOne() {
        var validContract = this.props.web3.isAddress(this.state.tokenContract);
        return (
            <div>
            <h5> 1. Specify token to trade away</h5>

            <Form>
                <FormGroup row>
                  <Label for="contract" sm={2}>Contract Address</Label>
                  <Col sm={6}>
                      <Input
                        type="text"
                        id="contract"
                        valid={validContract}
                        invalid={this.state.tokenContract !== null && !validContract}
                        onChange={this.handleTokenContractChange}
                      />
                      <FormText>Enter the ERC721 contract address of the token you want to trade.</FormText>
                      <FormFeedback tooltip>Please enter a valid address.</FormFeedback>
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Label for="tokenId" sm={2}>Token ID</Label>
                  <Col sm={6}>
                      <Input
                        type="number"
                        id="tokenId"
                        valid={this.state.validContractAndTokenOwned == ValidationStatus.valid}
                        invalid={this.state.validContractAndTokenOwned == ValidationStatus.invalid}
                        disabled={!validContract}
                        onChange={this.handleTokenSellIdChange}
                      />
                      <FormFeedback tooltip>You must own the token you want to trade.</FormFeedback>
                      <FormText>For the contract above, provide the token ID.</FormText>
                  </Col>

                  <Col sm={2}>
                      <button
                          disabled={this.ownershipButtonDisabled()}
                          className="pure-button pure-button-primary"
                          onClick={this.handleCheckOwnership}
                      >
                              Check Ownership
                      </button>
                 </Col>
                </FormGroup>
             </Form>
            </div>
        );
    }






























    // Step 2
    handleTokenBuyIdChange(event) {
      this.setState({
          tokenBuyId: event.target.value,
          tokenBuyIdExists: ValidationStatus.unchecked,
          withdrawalApproved: false,
          tradeCreated: false
      });
    }

    handleCheckExistence(event) {
        var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, this.state.tokenContract)
        try {
            if(ERC721Instance.exists(this.state.tokenBuyId)) {
                this.setState({tokenBuyIdExists: ValidationStatus.valid});
            } else {
                this.setState({tokenBuyIdExists: ValidationStatus.invalid});
            }
        } catch(e) {
            this.setState({tokenBuyIdExists: ValidationStatus.invalid});
            console.log("Checking existence failed: ", e);
        }
        event.preventDefault();
    }

    // Util for step 1
    existenceButtonDisabled() {
        return (this.state.validContractAndTokenOwned != ValidationStatus.valid
                || this.state.tokenBuyId == null);
    }

    stepTwo() {
        return (
            <div>
                <h5> 2. Which token do you want? </h5>
                <Form>
                    <FormGroup row>
                      <Label for="tokenId" sm={2}>Token ID</Label>
                      <Col sm={6}>
                          <Input
                            type="number"
                            id="tokenId"
                            valid={this.state.tokenBuyIdExists == ValidationStatus.valid}
                            invalid={this.state.tokenBuyIdExists == ValidationStatus.invalid}
                            disabled={this.state.validContractAndTokenOwned != ValidationStatus.valid}
                            onChange={this.handleTokenBuyIdChange}
                          />
                          <FormFeedback tooltip>The token you want must exist.</FormFeedback>
                          <FormText>For the contract above, provide the ID of the token you want.</FormText>
                      </Col>

                      <Col sm={2}>
                          <button
                              disabled={this.existenceButtonDisabled()}
                              className="pure-button pure-button-primary"
                              onClick={this.handleCheckExistence}
                          >
                                  Check Existence
                          </button>
                     </Col>
                    </FormGroup>
                </Form>
         </div>
        )
    }
















    // Step 3
    handleCreateTrade(event) {
        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        var EtheraryInstance = ContractUtils.getContractInstance(this.props.web3, EtheraryContract.abi, etheraryAddress)

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

        WatchForEvent(creationEvent)
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
        var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, this.state.tokenContract)

        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        ERC721Instance.approve(etheraryAddress, this.state.tokenSellId, {from: this.props.web3.eth.accounts[0]})

        var approvalEvent = ERC721Instance.Approval({
            _owner: this.props.web3.eth.accounts[0],
            _approved: etheraryAddress,
            _tokenId: this.state.tokenSellId
        })

        WatchForEvent(approvalEvent)
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
        return (this.state.validContractAndTokenOwned != ValidationStatus.valid
                || this.state.tokenBuyIdExists != ValidationStatus.valid);
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
            <h5> 3. Create the trade </h5>

            <Form>
                <FormGroup row>
                <Col sm={2}>
                    <button
                        disabled={this.approvalButtonDisabled()}
                        className="pure-button pure-button-primary"
                        onClick={this.handleApproval}
                    >
                            Approve
                    </button>
               </Col>

                  <Col sm={2}>
                      <button
                          disabled={this.createButtonDisabled()}
                          className="pure-button pure-button-primary"
                          onClick={this.handleCreateTrade}
                      >
                              Create Trade
                      </button>
                 </Col>
                </FormGroup>
            </Form>


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
//Specify a valid ERC721 contract address which handles the token you want to trade, as well as the token ID.
