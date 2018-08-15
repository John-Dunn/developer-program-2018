import React, { Component } from 'react'
import { Button, Row, Col, FormGroup } from 'reactstrap';

import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'

import Etherary from '../../build/contracts/Etherary.json'
import TradeCardWrapper from './TradeCards/TradeCardWrapper'



class MyTrades extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trades: [],
            done: false
        }
    }



    getAllTrades() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.tradeId()
        .then(function(numberOfTrades) {

            for (var i = 0; i<numberOfTrades.toNumber(); i++) {
                EtheraryInstance.idToTrade(i)
                .then(function(trade){
                    console.log("Trade Added", trade);
                    this.setState(prevState => ({
                        trades: prevState.trades.concat([trade])
                    }))
                }.bind(this))
            }
        }.bind(this))

    }

    displayTwoTrades() {
        console.log("First Trade", this.state.trades[0]);
        return(
            <FormGroup row>
                <Col sm="6">
                <TradeCardWrapper
                    web3={this.props.web3}
                    tradeId={0}
                    trade={this.state.trades[0]}
                    makerTokenWithdrawable={false}
                    takerTokenWithdrawable={false}
                  />
                </Col>

                <Col sm="6">
                <TradeCardWrapper
                    web3={this.props.web3}
                    tradeId={0}
                    trade={this.state.trades[1]}
                    makerTokenWithdrawable={false}
                    takerTokenWithdrawable={false}
                  />
                </Col>
            </FormGroup>
        )
    }

    render() {
        console.log("number of trades", this.state.trades.length)
        return (
            <div>
                <p>
                    This is an experimental feature. Prior trades are called from the blockchain. It would be better for a persistent database to keep accurate track of trades listening to the events.
                </p>
                <div className="centered">
                    <Button color="primary" size="lg" onClick={this.getAllTrades.bind(this)} >Load Trades</Button> {' '}
                    <Button color="primary" size="lg" onClick={() => {this.setState({done: true})}} >Display Trades</Button>
                </div>
                {
                    this.state.done
                    ? this.displayTwoTrades()
                    : "Well"
                }
            </div>
        );
    }
}

export default MyTrades
