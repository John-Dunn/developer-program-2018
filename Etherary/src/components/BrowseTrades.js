import React, { Component } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText, Col} from 'reactstrap';
var truffleContract = require("truffle-contract");
import {getContractInstance} from '../utils/getContractInstance'

import TradeCardWrapper from './TradeCards/TradeCardWrapper'
import Etherary from '../../build/contracts/Etherary.json'


class BrowseTrades extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tradeIdInput: null,
            tradeId: null,
            trade: null
        }
    }


    handleTradeIdChange(event) {
      this.setState({
          tradeIdInput: event.target.value
      });
    }

    handleTradeLookup(event) {
        if (this.state.tradeIdInput === null) { return }

        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.idToSellOrder(this.state.tradeIdInput)
        .then(function(trade) {
            this.setState({
                tradeId: this.state.tradeIdInput,
                trade: trade
            })
        }.bind(this))
        .catch(function(err) {
            console.log("Unable to get trade:", err);
        })
        event.preventDefault();
    }

    tradeValid() {
        return this.state.trade !== null && this.state.trade[0] !== "0x0000000000000000000000000000000000000000";
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
                    ? <TradeCardWrapper web3={this.props.web3} tradeId={this.state.tradeId} trade={this.state.trade}/>
                    : <div></div>
                }
            </div>
        );
    }
}

export default BrowseTrades
