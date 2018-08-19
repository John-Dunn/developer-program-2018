import React, { Component } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText, Col, Button, InputGroupButtonDropdown, DropdownToggle, DropdownMenu} from 'reactstrap';

// Custom components
import TradeCardWrapper from './TradeCards/TradeCardWrapper'

// Utils
import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'
import {
    tradeToMaker,
    tradeToMakerContract,
    tradeToTakerContract,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../utils/tradeUnpacking'

// Contracts
import Etherary from '../../build/contracts/Etherary.json'
import ERC721 from '../resources/ERC721Basic.json'


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
        this.updateTrade();
        event.preventDefault();
    }

    updateTrade() {
        console.log("Updating trade");
        if (this.state.tradeIdInput === null) { return }

        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.idToTrade.call(this.state.tradeIdInput, {gas: 500000+Math.floor(Math.random()*1001)})
        .then(function(trade) {
            this.setState({
                tradeId: this.state.tradeIdInput,
                trade: trade
            })
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
                <Form>
                <FormGroup row>
                  <Label for="tokenId" sm={3}>Trade ID</Label>
                  <Col sm={7}>
                      <Input
                        type="number"
                        id="tokenId"
                        placeholder="123"
                        invalid={this.tradeInvalid()}
                        onChange={this.handleTradeIdChange.bind(this)}
                      />

                      <FormFeedback tooltip>This trade ID does not exist.</FormFeedback>
                      <FormText>Enter the ID of the trade you want to look up.</FormText>
                  </Col>

                  <Col sm={2}>
                      <Button
                          type="submit"
                          color="primary"
                          onClick={this.handleTradeLookup.bind(this)}
                      >
                        Lookup Trade
                      </Button>
                 </Col>
                </FormGroup>
                </Form>

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
