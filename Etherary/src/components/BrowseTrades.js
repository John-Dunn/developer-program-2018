import React, { Component } from 'react'
import EtheraryContract from '../../build/contracts/Etherary.json'
import ContractUtils from '../utils/contractUtils'
import TradeCard from './TradeCard'

import { Form, FormGroup, Label, Input, FormFeedback, FormText, Col} from 'reactstrap';


class BrowseTrades extends Component {

    constructor(props) {
        super(props);
        this.state = {
            orderIdInput: -1,
            orderId: null,
            trade: null
        }

        this.handleTradeIdChange = this.handleTradeIdChange.bind(this);
        this.handleTradeLookup = this.handleTradeLookup.bind(this);
    }

    handleTradeIdChange(event) {
      this.setState({
          orderIdInput: event.target.value
      });
    }

    handleTradeLookup(event) {
        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        var EtheraryInstance = ContractUtils.getContractInstance(this.props.web3, EtheraryContract.abi, etheraryAddress);
        try {
            var trade = EtheraryInstance.idToSellOrder(this.state.orderIdInput);
            this.setState({
                orderId: this.state.orderIdInput,
                trade: trade
            });
        } catch(e) {
            console.log("Checking ownership failed: ", e);
        }
        event.preventDefault();
    }

    tradeValid() {
        return this.state.trade !== null && this.state.trade[0] !== "0x0000000000000000000000000000000000000000";
    }

    tradeInvalid() {
        if (this.state.orderId === null) {
            return false;
        } else {
            return !this.tradeValid()
        }
    }


    render() {
        return (
            <div>
                <h2> You can browse trades here!</h2>
                Some sample text here    .


                <FormGroup row>
                  <Label for="tokenId" sm={2}>Token ID</Label>
                  <Col sm={6}>
                      <Input
                        type="number"
                        id="tokenId"
                        invalid={this.tradeInvalid()}
                        onChange={this.handleTradeIdChange}
                      />
                      <FormFeedback tooltip>This trade ID does not exist.</FormFeedback>
                      <FormText>Enter the ID of the trade you want to look up.</FormText>
                  </Col>

                  <Col sm={2}>
                      <button
                          className="pure-button pure-button-primary"
                          onClick={this.handleTradeLookup}
                      >
                              Lookup Trade
                      </button>
                 </Col>
                </FormGroup>

                {
                    this.tradeValid()
                    ? <TradeCard web3={this.props.web3} orderId={this.state.orderId} trade={this.state.trade}/>
                    : <div></div>
                }
            </div>

        );
    }
}

export default BrowseTrades
