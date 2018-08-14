import React, { Component } from 'react'
import { FormGroup, Label, Input, FormFeedback, FormText, Col} from 'reactstrap';

import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'
import {tradeToMaker, tradeToContract, tradeToMakerTokenId, tradeToTakerTokenId, tradeToActive, tradeToTaker} from '../utils/tradeUnpacking'

import TradeCardWrapper from './TradeCards/TradeCardWrapper'

import Etherary from '../../build/contracts/Etherary.json'
import ERC721 from '../resources/ERC721Basic.json'


class BrowseTrades extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tradeIdInput: null,
            tradeId: null,
            trade: null,

            makerTokenOwner: null,
            makerTokenApproved: false,

            takerTokenOwner: null,
            takerTokenApproved: false

        }
    }

    handleTradeIdChange(event) {
      this.setState({
          tradeIdInput: event.target.value
      });
    }

    handleTradeLookup(event) {
        this.updateTrade();
        event.preventDefault();
    }

    tokenWithdrawable(approved, tokenOwner) {
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        return approved && tokenOwner === etheraryAddress;
    }


    isTakerTokenApproved(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToContract(trade));
        ERC721Instance.getApproved(tradeToTakerTokenId(trade))
        .then(function(approved) {
            var isApproved = this.props.web3.eth.accounts[0] === approved;
            this.setState({takerTokenApproved: isApproved});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying approval failed: ", err);
        })
    }

    isMakerTokenApproved(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToContract(trade));
        ERC721Instance.getApproved(tradeToMakerTokenId(trade))
        .then(function(approved) {
            var isApproved = this.props.web3.eth.accounts[0] === approved;
            this.setState({makerTokenApproved: isApproved});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying approval failed: ", err);
        })
    }





    getTakerTokenOwner(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToContract(trade));
        ERC721Instance.ownerOf(tradeToTakerTokenId(trade))
        .then(function(owner) {
            this.setState({takerTokenOwner: owner});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        })
    }

    getMakerTokenOwner(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToContract(trade));
        ERC721Instance.ownerOf(tradeToMakerTokenId(trade))
        .then(function(owner) {
            this.setState({makerTokenOwner: owner});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        })
    }






    updateTrade() {
        console.log("Updating trade");
        if (this.state.tradeIdInput === null) { return }

        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.idToSellOrder(this.state.tradeIdInput)
        .then(function(trade) {
            this.setState({
                tradeId: this.state.tradeIdInput,
                trade: trade
            })
            this.getMakerTokenOwner(trade);
            this.getTakerTokenOwner(trade);
            this.isTakerTokenApproved(trade);
            this.isMakerTokenApproved(trade);
        }.bind(this))
        .catch(function(err) {
            console.log("Unable to get trade:", err);
        })
    }

    tradeValid() {
        return this.state.trade !== null && tradeToMaker(this.state.trade) !== "0x0000000000000000000000000000000000000000";
    }

    tradeInvalid() {
        if (this.state.tradeId === null) {
            return false;
        } else {
            return !this.tradeValid()
        }
    }

    render() {
        return (
            <div>
            <div className="centered">
                <FormGroup row>
                  <Label for="tokenId" sm={2}>Trade ID</Label>
                  <Col sm={8}>
                      <Input
                        type="number"
                        id="tokenId"
                        invalid={this.tradeInvalid()}
                        onChange={this.handleTradeIdChange.bind(this)}
                      />
                      <FormFeedback tooltip>This trade ID does not exist.</FormFeedback>
                      <FormText>Enter the ID of the trade you want to look up.</FormText>
                  </Col>

                  <Col sm={2}>
                      <button
                          className="pure-button pure-button-primary"
                          onClick={this.handleTradeLookup.bind(this)}
                      >
                              Lookup Trade
                      </button>
                 </Col>
                </FormGroup>
            </div>
                {
                    this.tradeValid()
                    ?
                    <div className="centered">
                        <Col sm="6">
                        <TradeCardWrapper
                            web3={this.props.web3}
                            tradeId={this.state.tradeId}
                            trade={this.state.trade}
                            reloadCallback={this.updateTrade.bind(this)}
                            makerTokenWithdrawable={this.tokenWithdrawable(this.state.makerTokenApproved, this.state.makerTokenOwner)}
                            takerTokenWithdrawable={this.tokenWithdrawable(this.state.takerTokenApproved, this.state.takerTokenOwner)}
                          />
                        </Col>
                    </div>
                    : <div></div>
                }
            </div>
        );
    }
}

export default BrowseTrades
