import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

var truffleContract = require("truffle-contract");
import ERC721 from '../../resources/ERC721Basic.json'

import TradeCardBody from './TradeCardBody'
import TradeModal from './TradeModal'

import Etherary from '../../../build/contracts/Etherary.json'

import getContractInstance from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'



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
        console.log("Cancel", EtheraryInstance);
        EtheraryInstance.cancelERC721SellOrder(this.props.tradeId, {from:this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                orderId: this.props.web3.toBigNumber(this.props.tradeId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Trade cancelled');
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
        var ERC721Contract = truffleContract(ERC721);
        ERC721Contract.setProvider(this.props.web3.currentProvider)
        var ERC721Instance = ERC721Contract.at(this.props.trade[1]);

        ERC721Instance.ownerOf(this.props.trade[3].toNumber())
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
            <div className="centered">
                <Col sm="6">
                    <TradeCardBody
                        account={this.props.web3.eth.accounts[0]}
                        active={this.props.trade[4]}
                        tradeId={this.props.tradeId}
                        maker={this.props.trade[0]}
                        taker={this.props.trade[5]}
                        makerTokenId={this.props.trade[2].toNumber()}
                        takerTokenId={this.props.trade[3].toNumber()}
                        contract={this.props.trade[1]}
                        cancelCallback={this.cancelCallback.bind(this)}
                        tradeCallback={this.tradeCallback.bind(this)}
                    />
                </Col>
                <TradeModal
                    show={this.state.showTradeModal}
                    toggleCallback={this.toggleTradeModal.bind(this)}
                    tradeId={this.props.tradeId}
                    account={this.props.web3.eth.accounts[0]}
                    active={this.props.trade[4]}
                    maker={this.props.trade[0]}
                    taker={this.props.trade[5]}
                    makerTokenId={this.props.trade[2].toNumber()}
                    takerTokenId={this.props.trade[3].toNumber()}
                    contract={this.props.trade[1]}
                    takerTokenOwner={this.state.takerTokenOwner}
                    web3={this.props.web3}
                />
            </div>

        );
    }

};


export default TradeCardWrapper;
