import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ERC721abi from '../resources/ERC721BasicABI.json'
import ContractUtils from '../utils/contractUtils'
import EtheraryContract from '../../build/contracts/Etherary.json'
import WatchForEvent from '../utils/watchForEvent'


class TradeInfo extends Component {
    render() {
        return(
            <font size="2">
                Creator: <strong>{this.props.trade[0]}</strong> <br></br>
                Active: <strong>{this.props.trade[4] ? 'Yes' : 'No'}</strong>. <br></br>
                ERC721 token contract: <strong>{this.props.trade[1]}</strong> <br></br>
                Offers: <strong>Token #{this.props.trade[2].toNumber()}</strong> Wants: <strong>Token #{this.props.trade[3].toNumber()}</strong> <br></br>
            </font>
        )
    }
}



class TradeCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
          fillModal: false,
          tradeFillable:false,
          withdrawalApproved:false,
          tradeFilled: false
        };

        this.toggleModalFill = this.toggleModalFill.bind(this);
        this.handleApproval = this.handleApproval.bind(this);
        this.handleFillTrade = this.handleFillTrade.bind(this);

    }

    toggleModalFill() {
      var fillable = this.tradeFillable(this.props.trade);
      this.setState({
        fillModal: !this.state.fillModal,
        tradeFillable: fillable
      });
    }

    tradeFillable(trade) {
        var active = trade[4];
        var owned = false;

        try {
            var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, trade[1])
            var owner = ERC721Instance.ownerOf(trade[3]);
            owned = owner === this.props.web3.eth.accounts[0]
        } catch(e) {
            console.log("Checking ownership failed: ", e);
        }

        return active && owned;

    }


    handleApproval(event) {
        var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, this.props.trade[1])

        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        ERC721Instance.approve(etheraryAddress, this.props.trade[3], {from: this.props.web3.eth.accounts[0]})

        var approvalEvent = ERC721Instance.Approval({
            _owner: this.props.web3.eth.accounts[0],
            _approved: etheraryAddress,
            _tokenId: this.props.trade[3]
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

    handleApproval(event) {
        var ERC721Instance = ContractUtils.getContractInstance(this.props.web3, ERC721abi, this.props.trade[1])

        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        ERC721Instance.approve(etheraryAddress, this.props.trade[3], {from: this.props.web3.eth.accounts[0]})

        var approvalEvent = ERC721Instance.Approval({
            _owner: this.props.web3.eth.accounts[0],
            _approved: etheraryAddress,
            _tokenId: this.props.trade[3]
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

    componentDidUpdate(prevProps) {
        console.log("Prev ", prevProps);
        console.log("Current", this.props);
        if(prevProps.orderId !== this.props.orderId) {
            console.log("We get here")
            this.setState({
                fillModal: false,
                tradeFillable:false,
                withdrawalApproved:false,
                tradeFilled: false
            })
        }
    }

    handleFillTrade(event) {
        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        var EtheraryInstance = ContractUtils.getContractInstance(this.props.web3, EtheraryContract.abi, etheraryAddress)

        EtheraryInstance.fillERC721SellOrder(
            this.props.orderId,
            {from: this.props.web3.eth.accounts[0], gas:500000}
        );

        var fillEvent = EtheraryInstance.SellOrderFilled({
            orderId: this.props.orderId
        })

        WatchForEvent(fillEvent)
        .then(results => {
            this.setState({
                tradeFilled: true
            })
            console.log('Trade filled with id ', this.props.orderId);
        })
        .catch(function(error) {
            console.log('Error watching for SellOrderFilled events: ', error);
        });

        event.preventDefault();
    }

    tradeInfoMsg() {
        if (this.state.tradeFilled) {
            return <strong> <font color='green'>Trade filled! You can now withdraw your new token. </font> </strong>
        }

        if (this.state.tradeFillable) {
            return <strong> <font color='green'>Trade is active and you own the token.</font> </strong>
        } else {
            return <strong> <font color='red'>You cannot fill this trade, it is inactive or you do not own it.</font> </strong>
        }

    }


    buttonRow() {
        if(this.state.tradeFilled) {
            return (
                <div>
                    <Button onClick={this.handleWithdrawToken}>Withdraw</Button>{'   '}
                    <Button onClick={this.toggleModalFill}>Cancel</Button>
                </div>
            )

        }

        if(this.state.tradeFillable) {
            return (
                <div>
                    <Button
                        color={this.state.withdrawalApproved ? "success" : "secondary"}
                        onClick={this.handleApproval}
                    > Approve </Button> {'   '}

                    <Button
                        color={this.state.tradeFilled ? "success" : "secondary"}
                        disabled={!this.state.withdrawalApproved}
                        onClick={this.handleFillTrade}
                    > Fill </Button> {'   '}

                    <Button onClick={this.toggleModalFill}>Cancel</Button>
                </div>
            )
        } else {
            return (
                <Button onClick={this.toggleModalFill}>Cancel</Button>
            )
        }


    }



    render() {
        return (
            <div>
            <Col sm="6">
              <Card body>
                <CardTitle>Trade #{this.props.orderId}</CardTitle>
                <CardText>
                        <TradeInfo trade={this.props.trade}/>
                        <Button onClick={this.toggleModalFill}>Fill</Button>{' '}
                        <Button>Cancel</Button>
                </CardText>
              </Card>
            </Col>

            <Modal isOpen={this.state.fillModal} toggle={this.toggleModalFill} className={this.props.className}>
              <ModalHeader toggle={this.toggleModalFill}>Filling trade #{this.props.orderId}</ModalHeader>
              <ModalBody>
                <TradeInfo trade={this.props.trade} />
                {this.tradeInfoMsg()}

              </ModalBody>
              <ModalFooter>
                {this.buttonRow()}
              </ModalFooter>
            </Modal>
            </div>

        );
    }

};

export default TradeCard;
