import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

var truffleContract = require("truffle-contract");
import ERC721 from '../../resources/ERC721Basic.json'

import TradeCardBody from './TradeCardBody'
import TradeModal from './TradeModal'

import Etherary from '../../../build/contracts/Etherary.json'

import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'

import {tradeToMaker, tradeToContract, tradeToMakerTokenId, tradeToTakerTokenId, tradeToActive, tradeToTaker} from '../../utils/tradeUnpacking'


class TradeCardWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
          showTradeModal: false,
          takerTokenOwner: null
        };

    }

    cancelCallback() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.cancelERC721SellOrder(this.props.tradeId, {from:this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                orderId: this.props.web3.toBigNumber(this.props.tradeId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Trade cancelled');
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error cancelling: ', error);
        });
    }


    // Modal handling
    tradeCallback() {
        this.getTakerTokenOwner();
        this.setState({
            showTradeModal: true
        })
    }

    toggleTradeModal() {
        this.setState({
            showTradeModal: !this.state.showTradeModal
        })
    }

    getTakerTokenOwner() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToContract(this.props.trade));
        ERC721Instance.ownerOf(tradeToTakerTokenId(this.props.trade))
        .then(function(owner) {
            console.log("Token owner: ", owner);
            this.setState({takerTokenOwner: owner});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        }.bind(this))
    }

    render() {
        return (
            <div>
                <TradeCardBody
                    account={this.props.web3.eth.accounts[0]}
                    active={tradeToActive(this.props.trade)}
                    tradeId={this.props.tradeId}
                    maker={tradeToMaker(this.props.trade)}
                    taker={tradeToTaker(this.props.trade)}
                    makerTokenId={tradeToMakerTokenId(this.props.trade)}
                    takerTokenId={tradeToTakerTokenId(this.props.trade)}
                    contract={tradeToContract(this.props.trade)}
                    cancelCallback={this.cancelCallback.bind(this)}
                    tradeCallback={this.tradeCallback.bind(this)}
                    reloadCallback={this.props.reloadCallback.bind(this)}
                    makerTokenWithdrawable={this.props.makerTokenWithdrawable}
                    takerTokenWithdrawable={this.props.takerTokenWithdrawable}
                    web3={this.props.web3}
                />
                <TradeModal
                    show={this.state.showTradeModal}
                    toggleCallback={this.toggleTradeModal.bind(this)}
                    tradeId={this.props.tradeId}
                    account={this.props.web3.eth.accounts[0]}
                    active={tradeToActive(this.props.trade)}
                    maker={tradeToMaker(this.props.trade)}
                    taker={tradeToTaker(this.props.trade)}
                    makerTokenId={tradeToMakerTokenId(this.props.trade)}
                    takerTokenId={tradeToTakerTokenId(this.props.trade)}
                    contract={tradeToContract(this.props.trade)}
                    takerTokenOwner={this.state.takerTokenOwner}
                    web3={this.props.web3}
                    reloadCallback={this.props.reloadCallback}
                />
            </div>

        );
    }

};


export default TradeCardWrapper;
