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
            trade: null,
            trades: []
        }
    }

    componentDidMount() {
        if( this.props.web3Connected) {
            this.getAllTrades();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.web3 !== prevProps.web3) {
            console.log("Web3 change: ", this.props.web3)
            this.getAllTrades();
        }
    }

    getAllTrades() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);

        EtheraryInstance.tradeId()
        .then(function(numberOfTrades) {
            var promises = [];
            for (var i = 0; i<numberOfTrades.toNumber(); i++){
                promises.push(EtheraryInstance.idToTrade(i));
            }
            Promise.all(promises)
            .then(function(resolvedPromises){
                this.setState({
                    trades: resolvedPromises
                })
                console.log("Trades: ", resolvedPromises)
            }.bind(this))
        }.bind(this))
    }

    displayTrades() {
        var cards = [];
        console.log("Displaying", this.state.trades.length);
        for (var i = 0; i<this.state.trades.length; i++) {
            var card = this.tradeToCard(this.state.trades[i], i);
            console.log("Card", card);
            cards.push(card);
        }
        console.log("Cards:",cards)
        return cards;
    }

    tradeToCard(trade, id) {
        return (
            <Col sm="6" key={id}>
            <TradeCardWrapper
                web3={this.props.web3}
                tradeId={id}
                trade={trade}
                reloadCallback={this.updateTrade.bind(this)}
             />
            </Col>
        )
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
                {this.displayTrades()}
            </div>





        );
    }
}

export default BrowseTrades
