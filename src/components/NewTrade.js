import React from 'react';
import {
    Row,
    Col,
    Form,
    FormLabel,
    Label,
    FormText,
    FormFeedback,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    InputGroupDropdown,
    Input,
    Button,
    ButtonDropdown,
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
 import ERC20 from '../resources/ERC20Basic.json'

 import Etherary from '../../build/contracts/Etherary.json'

 import ERC721FaucetA from '../../build/contracts/GenericERC721TokenA.json'
 import ERC721FaucetB from '../../build/contracts/GenericERC721TokenB.json'
 import ERC20FaucetA from '../../build/contracts/GenericERC20TokenA.json'
 import ERC20FaucetB from '../../build/contracts/GenericERC20TokenB.json'



export default class NewTrade extends React.Component {
    constructor(props) {
        super(props);

        this.toggleMakerSplit = this.toggleMakerSplit.bind(this);
        this.toggleTakerSplit = this.toggleTakerSplit.bind(this);

        this.state = {
            // Step 1
            tokenContractMaker: null,
            makerTokenIdOrAmount: null,
            validContractAndTokenOwned: ValidationStatus.unchecked,

            makerDropdownOpen: false,
            makerSplitButtonOpen: false,
            makerButtonDropdownOpen: false,
            makerButtonDropdownMsg: "Pick token type",
            makerContractTypeIsERC20: ValidationStatus.unchecked,


            // Step 2
            tokenContractTaker: null,
            takerTokenIdOrAmount: '',
            takerTokenIdExists: ValidationStatus.unchecked,
            takerDropdownOpen: false,
            takerSplitButtonOpen: false,
            takerButtonDropdownMsg: "Pick token type",
            takerContractTypeIsERC20: ValidationStatus.unchecked,

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

    handlemakerTokenIdOrAmountChange(event) {
        var isERC20 = this.state.makerContractTypeIsERC20 === ValidationStatus.valid;
        this.setState({
            makerTokenIdOrAmount: (isERC20 ? this.props.web3.toWei(event.target.value) : event.target.value),
            validContractAndTokenOwned: ValidationStatus.unchecked,
            withdrawalApproved: false,
            tradeCreated: false
        });
    }

  handleCheckOwnership(event) {
        if (this.state.makerContractTypeIsERC20 === ValidationStatus.valid) {
              this.handleCheckOwnershipERC20();
        }

        if (this.state.makerContractTypeIsERC20 === ValidationStatus.invalid) {
            this.handleCheckOwnershipERC721();
        }
      event.preventDefault();
  }

    handleCheckOwnershipERC721() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContractMaker);

        ERC721Instance.ownerOf(this.state.makerTokenIdOrAmount)
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
    }

    handleCheckOwnershipERC20() {
        var ERC20Instance = instantiateContractAt(ERC20, this.props.web3, this.state.tokenContractMaker);
        ERC20Instance.balanceOf(this.props.web3.eth.accounts[0])
        .then(function(balance) {
            if(parseInt(balance.toNumber()) >= this.state.makerTokenIdOrAmount) {
                this.setState({validContractAndTokenOwned: ValidationStatus.valid});
            } else {
                this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
            }
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
            this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
        }.bind(this))
    }

    // Util for step 1
    ownershipButtonDisabled() {
        return (
            !this.props.web3.isAddress(this.state.tokenContractMaker)
            || this.state.makerTokenIdOrAmount == null
            || this.state.makerContractTypeIsERC20 === ValidationStatus.unchecked
        );
    }

    contractAndMakerTokenValid() {
        return this.state.validContractAndTokenOwned === ValidationStatus.valid;
    }

    toggleMakerSplit() {
        this.setState({
            makerSplitButtonOpen: !this.state.makerSplitButtonOpen
        });
    }

    toggleMakerButton() {
        this.setState({
            makerButtonDropdownOpen: !this.state.makerButtonDropdownOpen
        });
        document.getElementById("makerTokenIdOrAmount").value = '';
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

    handleMakerERCADropdown(event) {
        var faucetAddressC = ERC20FaucetA.networks[this.props.web3.version.network].address;
        this.setState({
            tokenContractMaker: faucetAddressC
        })
        document.getElementById("maker_token_input").value = faucetAddressC;
    }

    handleMakerERCBDropdown(event) {
        var faucetAddressD = ERC20FaucetB.networks[this.props.web3.version.network].address;
        this.setState({
            tokenContractMaker: faucetAddressD
        })
        document.getElementById("maker_token_input").value = faucetAddressD;
    }

    contractDropdown(isMakerContract) {
        var isOpen = isMakerContract ? this.state.makerSplitButtonOpen : this.state.takerSplitButtonOpen;
        var toggle = isMakerContract ? this.toggleMakerSplit : this.toggleTakerSplit;

        var antHandler = isMakerContract ? this.handleMakerAntDropdown.bind(this) : this.handleTakerAntDropdown.bind(this);
        var beaverHandler = isMakerContract ? this.handleMakerBeaverDropdown.bind(this) : this.handleTakerBeaverDropdown.bind(this);
        var ercAHandler = isMakerContract ? this.handleMakerERCADropdown.bind(this) : this.handleTakerERCADropdown.bind(this);
        var ercBHandler = isMakerContract ? this.handleMakerERCBDropdown.bind(this) : this.handleTakerERCBDropdown.bind(this);

        return(
            <InputGroupButtonDropdown addonType="append" isOpen={isOpen} toggle={toggle}>
                <DropdownToggle split outline />
                <DropdownMenu>
                    <DropdownItem onClick={antHandler}> Ant Contract</DropdownItem>
                    <DropdownItem onClick={beaverHandler}> Beaver Contract</DropdownItem>
                    <DropdownItem onClick={ercAHandler}> ERC20 A</DropdownItem>
                    <DropdownItem onClick={ercBHandler}> ERC20 B</DropdownItem>
                </DropdownMenu>
            </InputGroupButtonDropdown>
        )
    }

    handleButtonDropdownERC20() {
        this.setState({
            makerButtonDropdownMsg: 'ERC20',
            makerContractTypeIsERC20: ValidationStatus.valid,
            validContractAndTokenOwned: ValidationStatus.unchecked
        })
    }

    handleButtonDropdownERC721() {
        this.setState({
            makerButtonDropdownMsg: 'ERC721',
            makerContractTypeIsERC20: ValidationStatus.invalid,
            validContractAndTokenOwned: ValidationStatus.unchecked
        })
    }

    buttonDropdown() {
        return (
            <ButtonDropdown color="primary" isOpen={this.state.makerButtonDropdownOpen} toggle={this.toggleMakerButton.bind(this)}>
                <DropdownToggle color="primary" caret>
                {this.state.makerButtonDropdownMsg}
                </DropdownToggle>
                    <DropdownMenu>
                    <DropdownItem onClick={this.handleButtonDropdownERC20.bind(this)}>ERC20</DropdownItem>
                    <DropdownItem onClick={this.handleButtonDropdownERC721.bind(this)}>ERC721</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        )
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
                                {this.contractDropdown(true)}
                            </InputGroup>
                            <FormText>Enter the contract address of the token you want to trade.</FormText>
                        </Col>

                        <Col sm={2}>
                        {this.buttonDropdown()}
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Label for="makerTokenIdOrAmount" sm={2}>Token ID / Amount</Label>
                        <Col sm={6}>
                            <Input
                                type="number"
                                id="makerTokenIdOrAmount"
                                placeholder="E.g. 5 or 123145"
                                valid={this.contractAndMakerTokenValid()}
                                invalid={this.state.validContractAndTokenOwned === ValidationStatus.invalid}
                                disabled={!validContract || this.state.makerContractTypeIsERC20 === ValidationStatus.unchecked}
                                onChange={this.handlemakerTokenIdOrAmountChange.bind(this)}
                            />
                            <FormFeedback tooltip>You must own the token you want to trade.</FormFeedback>
                            <FormText>For the contract above, provide the token ID (ERC721) or amount (ERC20).</FormText>
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
    toggleTakerButton() {
        this.setState({
            takerButtonDropdownOpen: !this.state.takerButtonDropdownOpen
        });
        document.getElementById("takerTokenIdOrAmount").value = '';
    }

    handletokenContractTakerChange(event) {
        this.setState({
            tokenContractTaker: event.target.value,
            takerTokenIdExists: ValidationStatus.unchecked,
            tradeCreated: false
        });
    }

    handleTakerTokenIdChange(event) {
        var isERC20 = this.state.takerContractTypeIsERC20 === ValidationStatus.valid;

        this.setState({
            takerTokenIdOrAmount: (isERC20 ? this.props.web3.toWei(event.target.value) : event.target.value),
            takerTokenIdExists: ValidationStatus.unchecked,
            tradeCreated: false
        });
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

    handleTakerERCADropdown(event) {
        var faucetAddressC = ERC20FaucetA.networks[this.props.web3.version.network].address;
        this.setState({
            tokenContractTaker: faucetAddressC
        })
        document.getElementById("taker_token_input").value = faucetAddressC;
    }

    handleTakerERCBDropdown(event) {
        var faucetAddressD = ERC20FaucetB.networks[this.props.web3.version.network].address;
        this.setState({
            tokenContractTaker: faucetAddressD
        })
        document.getElementById("taker_token_input").value = faucetAddressD;
    }



    handleButtonDropdownTakerERC20() {
        this.setState({
            takerButtonDropdownMsg: 'ERC20',
            takerContractTypeIsERC20: ValidationStatus.valid
        })
    }

    handleButtonDropdownTakerERC721() {
        this.setState({
            takerButtonDropdownMsg: 'ERC721',
            takerContractTypeIsERC20: ValidationStatus.invalid
        })
    }

    buttonDropdownMaker() {
        return (
            <ButtonDropdown color="primary" isOpen={this.state.takerButtonDropdownOpen} toggle={this.toggleTakerButton.bind(this)}>
                <DropdownToggle color="primary" caret>
                    {this.state.takerButtonDropdownMsg}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={this.handleButtonDropdownTakerERC20.bind(this)}>ERC20</DropdownItem>
                    <DropdownItem onClick={this.handleButtonDropdownTakerERC721.bind(this)}>ERC721</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
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

                                {this.contractDropdown(false)}
                            </InputGroup>

                            <FormText>Enter the contract address of the token you want.</FormText>
                        </Col>

                        <Col sm={2}>
                            {this.buttonDropdownMaker()}
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Label for="takerTokenIdOrAmount" sm={2}>Token ID</Label>
                        <Col sm={6}>
                            <Input
                                type="number"
                                id="takerTokenIdOrAmount"
                                placeholder="E.g. 5 or 123145"
                                valid={false}
                                invalid={this.state.takerTokenIdExists === ValidationStatus.invalid}
                                disabled={!validContract || this.state.takerContractTypeIsERC20 === ValidationStatus.unchecked}
                                onChange={this.handleTakerTokenIdChange.bind(this)}
                            />
                            <FormFeedback tooltip>The token you want must exist.</FormFeedback>
                            <FormText>For the contract above, provide the token ID (ERC721) or the amount (ERC20).</FormText>
                        </Col>

                    </FormGroup>
                </Form>
            </div>
        );
    }







  // Step 3
    handleCreateTrade(event) {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        var makerERC20 = this.state.makerContractTypeIsERC20 === ValidationStatus.valid;
        var takerERC20 = this.state.takerContractTypeIsERC20 === ValidationStatus.valid;

        EtheraryInstance.createTrade(
            this.state.tokenContractMaker,
            makerERC20,
            this.state.makerTokenIdOrAmount,
            this.state.tokenContractTaker,
            takerERC20,
            this.state.takerTokenIdOrAmount,
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
        if (this.state.makerContractTypeIsERC20 === ValidationStatus.valid) {
            this.handleApprovalERC20(event);
        }

        if (this.state.makerContractTypeIsERC20 === ValidationStatus.invalid) {
            this.handleApprovalERC721(event);
        }
    }

    handleApprovalERC721(event) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContractMaker);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.approve(etheraryAddress, this.state.makerTokenIdOrAmount, {from: this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                _owner: this.props.web3.eth.accounts[0],
                _approved: etheraryAddress,
                _tokenId: this.props.web3.toBigNumber(this.state.makerTokenIdOrAmount)
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

    handleApprovalERC20(event) {
        var ERC20Instance = instantiateContractAt(ERC20, this.props.web3, this.state.tokenContractMaker);

        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC20Instance.approve(etheraryAddress, this.state.makerTokenIdOrAmount, {from: this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                owner: this.props.web3.eth.accounts[0],
                spender: etheraryAddress,
                value: this.props.web3.toBigNumber(this.state.makerTokenIdOrAmount)
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
                || !this.props.web3.isAddress(this.state.tokenContractTaker)
                || !(parseInt(this.state.takerTokenIdOrAmount) >= 0));
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
