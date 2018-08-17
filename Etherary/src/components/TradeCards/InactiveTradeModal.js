import React, { Component } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Col } from 'reactstrap';

import didEventOccur from '../../utils/didEventOccur'
import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import {tradeToMaker, tradeToMakerContract, tradeToTakerContract, tradeToMakerTokenId, tradeToTakerTokenId, tradeToActive, tradeToTaker} from '../../utils/tradeUnpacking'

import TradeCardContent from './TradeCardContent'

import ERC721 from '../../resources/ERC721Basic.json'
import Etherary from '../../../build/contracts/Etherary.json'

class InactiveTradeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            withdrawalComplete: false
        }
    }

    withdrawToken(tokenId, tokenContract) {
        var account = this.props.web3.eth.accounts[0];
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tokenContract);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.transferFrom(etheraryAddress, account, tokenId, {from: account, gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                _from: etheraryAddress,
                _to: account,
                _tokenId: this.props.web3.toBigNumber(tokenId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Withdrawal successful');
                this.setState({
                    withdrawalSuccessful: true
                })
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error withdrawing: ', error);
        });
    }

    withdrawMakerToken() {
        this.withdrawToken(tradeToMakerTokenId(this.props.trade), tradeToMakerContract(this.props.trade));
    }

    withdrawTakerToken() {
        this.withdrawToken(tradeToTakerTokenId(this.props.trade), tradeToTakerContract(this.props.trade));
    }


    statusMessage() {
        if(this.props.account === this.props.maker && this.props.makerTokenApproved) {
            return (<span> You created and cancelled this trade. You can withdraw your token.</span>);
        }
        if(this.props.account === this.props.maker && this.props.takerTokenApproved) {
            return (<span> Congratulations! You created this trade and it got filled. You can withdraw your token.</span>);
        }
        if(this.props.account === this.props.maker) {
            return (<span> Congratulations! You created this trade and it got filled. You already withdrew your token.</span>);
        }

        if(this.props.account === this.props.taker && this.props.makerTokenApproved) {
            return (<span> Congratulations! You completed this trade and can withdraw your token.</span>);
        }
        if(this.props.account === this.props.taker) {
            return (<span> Congratulations! You completed this trade. You already withdrew your token.</span>);
        }
        return;
    }

    buttonRow() {
        if(this.props.makerTokenApproved) {
            return <Button
                        color={this.state.withdrawalComplete? "success" : "primary"}
                        onClick={this.withdrawMakerToken.bind(this)}>
                    Withdraw
                    </Button>
        }

        if(this.props.takerTokenApproved) {
            return <Button
                        color={this.state.withdrawalComplete? "success" : "primary"}
                        onClick={this.withdrawTakerToken.bind(this)}>
                    Withdraw
                    </Button>
        }

        return <Button onClick={this.props.toggleCallback}>Go Back</Button>
    }


    render() {
        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleCallback}>
              <ModalHeader>Complete Trade #{this.props.tradeId}</ModalHeader>

              <ModalBody>
                {this.statusMessage()}
                <br></br> <br></br>
                <TradeCardContent
                    account={this.props.account}
                    active={this.props.active}
                    maker={this.props.maker}
                    taker={this.props.taker}
                    makerTokenId={this.props.makerTokenId}
                    takerTokenId={this.props.takerTokenId}
                    makerContract={this.props.makerContract}
                    takerContract={this.props.takerContract}
                />
              </ModalBody>

              <ModalFooter>
                {this.buttonRow()}
              </ModalFooter>
            </Modal>
        )
    }
}

export default InactiveTradeModal;
