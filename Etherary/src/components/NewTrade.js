import React from 'react';
import {Row,
 Col, Form, FormLabel, Label, FormText, FormFeedback,
 FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  InputGroupDropdown,
  Input,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
 } from 'reactstrap';

 import ValidationStatus from '../utils/enums'
 import didEventOccur from '../utils/didEventOccur'
 import getLogs from '../utils/getLogs'
 import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'

 import ERC721 from '../resources/ERC721Basic.json'
 import Etherary from '../../build/contracts/Etherary.json'

 import ERC721FaucetA from '../../build/contracts/GenericERC721TokenA.json'
 import ERC721FaucetB from '../../build/contracts/GenericERC721TokenB.json'



export default class NewTrade extends React.Component {
  constructor(props) {
    super(props);

    this.toggleMakerSplit = this.toggleMakerSplit.bind(this);
    this.toggleTakerSplit = this.toggleTakerSplit.bind(this);

    this.state = {
        // Step 1
        tokenContractMaker: null,
        makerTokenId: null,
        validContractAndTokenOwned: ValidationStatus.unchecked,

        makerDropdownOpen: false,
        makerSplitButtonOpen: false,

        // Step 2
        tokenContractTaker: null,
        takerTokenId: null,
        takerTokenIdExists: ValidationStatus.unchecked,
        takerDropdownOpen: false,
        takerSplitButtonOpen: false,

        // Step 3
        withdrawalApproved: false,
        tradeCreated: false,
        tradeId: -1




    };
  }






  // STEP 1

  // Handlers for Step 1
  handletokenContractMakerChange(event) {
      this.setState({
          tokenContractMaker: event.target.value,
          validContractAndTokenOwned: ValidationStatus.unchecked,
          withdrawalApproved: false,
          tradeCreated: false
      });
  }

  handleMakerTokenIdChange(event) {
    this.setState({
        makerTokenId: event.target.value,
        validContractAndTokenOwned: ValidationStatus.unchecked,
        withdrawalApproved: false,
        tradeCreated: false
    });
  }

  handleCheckOwnership(event) {
      var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContractMaker);

      ERC721Instance.ownerOf(this.state.makerTokenId)
      .then(function(owner) {
          if(owner === this.props.web3.eth.accounts[0]) {
              this.setState({validContractAndTokenOwned: ValidationStatus.valid});
          } else {
              this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
          }
      }.bind(this))
      .catch(function(err) {
          console.log("Querying ownership failed: ", err);
          this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
      }.bind(this))

      event.preventDefault();
  }

  // Util for step 1
  ownershipButtonDisabled() {
      return (!this.props.web3.isAddress(this.state.tokenContractMaker) || this.state.makerTokenId == null);
  }

  contractAndMakerTokenValid() {
      return this.state.validContractAndTokenOwned === ValidationStatus.valid;
  }

  toggleMakerSplit() {
    this.setState({
      makerSplitButtonOpen: !this.state.makerSplitButtonOpen
    });
  }


  handleMakerAntDropdown(event) {
      var faucetAddressA = ERC721FaucetA.networks[this.props.web3.version.network].address;

      this.setState({
          tokenContractMaker: faucetAddressA
      })
      document.getElementById("maker_token_input").value = faucetAddressA;
  }

  handleMakerBeaverDropdown(event) {
      var faucetAddressB = ERC721FaucetB.networks[this.props.web3.version.network].address;
      this.setState({
          tokenContractMaker: faucetAddressB
      })
      document.getElementById("maker_token_input").value = faucetAddressB;
  }

  stepOne() {
    var validContract = this.props.web3.isAddress(this.state.tokenContractMaker);

    return (
        <div>
            <h5> 1. Specify token to trade away</h5>
            <Form>
                <FormGroup row>
                    <Label for="contract" sm={2}>Contract Address</Label>

                    <Col sm={6}>
                        <InputGroup>
                            <Input
                                type="text"
                                id="maker_token_input"
                                placeholder="0xa6b..."
                                valid={validContract}
                                invalid={this.state.tokenContractMaker !== null && !validContract}
                                onChange={this.handletokenContractMakerChange.bind(this)}
                            />
                            <FormFeedback tooltip>Please enter a valid address.</FormFeedback>

                            <InputGroupButtonDropdown addonType="append" isOpen={this.state.makerSplitButtonOpen} toggle={this.toggleMakerSplit}>
                                <DropdownToggle split outline />
                                <DropdownMenu>
                                    <DropdownItem onClick={this.handleMakerAntDropdown.bind(this)}> Ant Contract</DropdownItem>
                                    <DropdownItem onClick={this.handleMakerBeaverDropdown.bind(this)}> Beaver Contract</DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        </InputGroup>

                        <FormText>Enter the ERC721 contract address of the token you want to trade.</FormText>
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Label for="makerTokenId" sm={2}>Token ID</Label>
                    <Col sm={6}>
                        <Input
                            type="number"
                            id="makerTokenId"
                            placeholder="123"
                            valid={this.contractAndMakerTokenValid()}
                            invalid={this.state.validContractAndTokenOwned === ValidationStatus.invalid}
                            disabled={!validContract}
                            onChange={this.handleMakerTokenIdChange.bind(this)}
                        />
                        <FormFeedback tooltip>You must own the token you want to trade.</FormFeedback>
                        <FormText>For the contract above, provide the token ID.</FormText>
                    </Col>

                    <Col sm={2}>
                        <Button
                            type="submit"
                            disabled={this.ownershipButtonDisabled()}
                            onClick={this.handleCheckOwnership.bind(this)}
                            color={this.contractAndMakerTokenValid() ? "success" : "primary"}
                        >
                            Check Ownership
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
      </div>
    );
  }


















  // Step 2
  handletokenContractTakerChange(event) {
      this.setState({
          tokenContractTaker: event.target.value,
          takerTokenIdExists: ValidationStatus.unchecked,
          tradeCreated: false
      });
  }

  handleTakerTokenIdChange(event) {
    this.setState({
        takerTokenId: event.target.value,
        takerTokenIdExists: ValidationStatus.unchecked,
        tradeCreated: false
    });
  }

  contractAndTakerTokenValid() {
      return this.state.takerTokenIdExists === ValidationStatus.valid;
  }

  handleCheckExistence(event) {
      var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContractTaker);

      ERC721Instance.exists(this.state.takerTokenId)
      .then(function(exists) {
          if (exists) {
              console.log("Token exists");
              this.setState({takerTokenIdExists: ValidationStatus.valid});
          } else {
              console.log("Token does not exist");
              this.setState({takerTokenIdExists: ValidationStatus.invalid});
          }
      }.bind(this))
      .catch(function(error){
          console.log("Checking existence failed: ", error);
          this.setState({takerTokenIdExists: ValidationStatus.invalid});
      }.bind(this))

      event.preventDefault();
  }

  // Util for step 1
  existenceButtonDisabled() {
      return (!this.props.web3.isAddress(this.state.tokenContractTaker)
              || this.state.takerTokenId == null);
  }

  takerTokenExists() {
      return this.state.takerTokenIdExists === ValidationStatus.valid;
  }

  toggleTakerSplit() {
    this.setState({
      takerSplitButtonOpen: !this.state.takerSplitButtonOpen
    });
  }


  handleTakerAntDropdown(event) {
      var faucetAddressA = ERC721FaucetA.networks[this.props.web3.version.network].address;

      this.setState({
          tokenContractTaker: faucetAddressA
      })
      document.getElementById("taker_token_input").value = faucetAddressA;
  }

  handleTakerBeaverDropdown(event) {
      var faucetAddressB = ERC721FaucetB.networks[this.props.web3.version.network].address;
      this.setState({
          tokenContractTaker: faucetAddressB
      })
      document.getElementById("taker_token_input").value = faucetAddressB;
  }



  stepTwoOld() {
      var validContract = this.props.web3.isAddress(this.state.tokenContractTaker);
      return (
          <div>
              <h5> 2. Which token do you want? </h5>

              <Form>
                  <FormGroup row>
                    <Label for="contract" sm={2}>Contract Address</Label>
                    <Col sm={6}>
                        <Input
                          type="text"
                          id="contract"
                          placeholder="0x45b..."
                          valid={validContract}
                          invalid={this.state.tokenContractTaker !== null && !validContract}
                          onChange={this.handletokenContractTakerChange.bind(this)}
                        />
                        <FormText>Enter the ERC721 contract address of the token you want.</FormText>
                        <FormFeedback tooltip>Please enter a valid address.</FormFeedback>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Label for="takerTokenId" sm={2}>Token ID</Label>
                    <Col sm={6}>
                        <Input
                          type="number"
                          id="takerTokenId"
                          placeholder="345"
                          valid={this.contractAndTakerTokenValid()}
                          invalid={this.state.takerTokenIdExists === ValidationStatus.invalid}
                          disabled={!validContract}
                          onChange={this.handleTakerTokenIdChange.bind(this)}
                        />
                        <FormFeedback tooltip>The token you want must exist.</FormFeedback>
                        <FormText>For the contract above, provide the token ID.</FormText>
                    </Col>

                    <Col sm={2}>
                        <Button
                            type="submit"
                            disabled={this.existenceButtonDisabled()}
                            onClick={this.handleCheckExistence.bind(this)}
                            color={this.takerTokenExists() ? "success" : "primary"}
                        >
                                Check Existence
                        </Button>
                   </Col>
                  </FormGroup>
              </Form>


       </div>
      )
  }



  stepTwo() {
    var validContract = this.props.web3.isAddress(this.state.tokenContractTaker);

    return (
        <div>
            <h5> 2. Which token do you want? </h5>
            <Form>
                <FormGroup row>
                    <Label for="taker_token_input" sm={2}>Contract Address</Label>

                    <Col sm={6}>
                        <InputGroup>
                            <Input
                                type="text"
                                id="taker_token_input"
                                placeholder="0x45b..."
                                valid={validContract}
                                invalid={this.state.tokenContractTaker !== null && !validContract}
                                onChange={this.handletokenContractTakerChange.bind(this)}
                            />
                            <FormFeedback tooltip>Please enter a valid address.</FormFeedback>

                            <InputGroupButtonDropdown addonType="append" isOpen={this.state.takerSplitButtonOpen} toggle={this.toggleTakerSplit}>
                                <DropdownToggle split outline />
                                <DropdownMenu>
                                    <DropdownItem onClick={this.handleTakerAntDropdown.bind(this)}> Ant Contract</DropdownItem>
                                    <DropdownItem onClick={this.handleTakerBeaverDropdown.bind(this)}> Beaver Contract</DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        </InputGroup>

                        <FormText>Enter the ERC721 contract address of the token you want.</FormText>
                    </Col>
                </FormGroup>

                <FormGroup row>
                    <Label for="tokenId" sm={2}>Token ID</Label>
                    <Col sm={6}>
                        <Input
                          type="number"
                          id="tokenId"
                          placeholder="345"
                          valid={this.contractAndTakerTokenValid()}
                          invalid={this.state.takerTokenIdExists === ValidationStatus.invalid}
                          disabled={!validContract}
                          onChange={this.handleTakerTokenIdChange.bind(this)}
                        />
                        <FormFeedback tooltip>The token you want must exist.</FormFeedback>
                        <FormText>For the contract above, provide the token ID.</FormText>
                    </Col>

                    <Col sm={2}>
                        <Button
                            disabled={this.existenceButtonDisabled()}
                            onClick={this.handleCheckExistence.bind(this)}
                            color={this.takerTokenExists() ? "success" : "primary"}
                        >
                            Check Existence
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
      </div>
    );
  }





  // Step 3
  handleCreateTrade(event) {
      var EtheraryInstance = getContractInstance(Etherary, this.props.web3);

      EtheraryInstance.createERC721Trade(
          this.state.tokenContractMaker,
          this.state.makerTokenId,
          this.state.tokenContractTaker,
          this.state.takerTokenId,
          {from: this.props.web3.eth.accounts[0], gas:500000}
      ).then(function(txid) {
          var txLogs = getLogs(txid);
          var id = txLogs[0].args._tradeId.toNumber();
          console.log("Trade created, id", id);
          this.setState({
              tradeId: id,
              tradeCreated: true
          })
      }.bind(this))

      event.preventDefault();
  }

  handleApproval(event) {
      var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContractMaker);

      var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
      ERC721Instance.approve(etheraryAddress, this.state.makerTokenId, {from: this.props.web3.eth.accounts[0]})
      .then(function(txid) {
          var expectedEvent = {
              _owner: this.props.web3.eth.accounts[0],
              _approved: etheraryAddress,
              _tokenId: this.props.web3.toBigNumber(this.state.makerTokenId)
          }
          if(didEventOccur(txid, expectedEvent)) {
              this.setState({
                  withdrawalApproved: true
              })
              console.log('Token approved');
          }
      }.bind(this))
      .catch(function(error) {
          console.log('Error approving: ', error);
      });

      event.preventDefault();
  }

  // Util for step 3
  approvalButtonDisabled() {
      return (this.state.validContractAndTokenOwned !== ValidationStatus.valid
              || this.state.takerTokenIdExists !== ValidationStatus.valid);
  }

  createButtonDisabled() {
      return this.approvalButtonDisabled() || !this.state.withdrawalApproved;
  }

  tradeCreatedMessage() {
      if (!this.state.tradeCreated) {
          return (<p></p>);
      } else {
          return(
              <p className="centered"> Trade successfully created! Trade id: &nbsp; <strong>{this.state.tradeId}</strong>.</p>
          )
      }
  }

  stepThree() {
      return (
          <div>
          <h5> 3. Create the trade </h5>
          In order to create a trade, the Etherary contract must be approved to withdraw
          your token. Once a trade is created, your token will be stored with the contract
          until you cancel your trade or if somebody fills it.
          <br></br>
          <br></br>
          <Form className="centered" >
              <FormGroup row>
              <Col sm={5}>
                  <Button
                      disabled={this.approvalButtonDisabled()}
                      color={this.state.withdrawalApproved ? "success" : "primary"}
                      onClick={this.handleApproval.bind(this)}
                  >
                          Approve
                  </Button>
             </Col>

                <Col sm={5}>
                    <Button
                        disabled={this.createButtonDisabled()}
                        color={this.state.tradeCreated ? "success" : "primary"}
                        onClick={this.handleCreateTrade.bind(this)}
                    >
                            Create Trade
                    </Button>
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
              <p> There are three steps to creating a new trade: </p>
              {this.stepOne()} <br/>
              {this.stepTwo()} <br/>
              {this.stepThree()}
          </div>
      );
  }
}
//{this.stepOne()}
