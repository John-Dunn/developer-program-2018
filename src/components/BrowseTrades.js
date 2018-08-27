import React, { Component } from 'react'
import { CardColumns, FormGroup, Label, Input, Col, Row } from 'reactstrap';

// Custom components
import TradeCardWrapper from './TradeCards/TradeCardWrapper'

// Utils
import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'
import {
    tradeToMaker,
    tradeToTaker,
    tradeToMakerContract,
    tradeToIsMakerContractERC20,
    tradeToIsTakerContractERC20,
    tradeToTakerContract,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive
} from '../utils/tradeUnpacking'

// Contracts
import Etherary from '../../build/contracts/Etherary.json'
import ERC721 from '../resources/ERC721Basic.json'


// Displays all trades
class BrowseTrades extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tradeIdInput: null,
            tradeId: null,
            trade: null,
            trades: [],
            hideInactive: true,
            showOnlyInvolved: false

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
        console.log("Updating trades")
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
            }.bind(this))
        }.bind(this))
    }

    displayTrades() {
        var cards = [];
        var tradesWithId = this.state.trades.map(function(trade, index) { return [trade, index]});
        var filteredTrades = tradesWithId.filter(this.activeFilter.bind(this));
        var fTrades = filteredTrades.filter(this.involvedFilter.bind(this));

        for (var i = 0; i<fTrades.length; i++) {
            var card = this.tradeToCard(fTrades[i][0], fTrades[i][1]);
            cards.push(card);
        }
        return cards;
    }

    activeFilter(trade) {
        if (!this.state.hideInactive && !tradeToActive(trade[0])) {
            return false;
        }
        return true;
    }

    involvedFilter(trade) {
        if (this.state.showOnlyInvolved) {
            var account = this.props.web3.eth.accounts[0];
            return tradeToMaker(trade[0]) === account || tradeToTaker(trade[0]) === account;
        }

        return true;
    }

    tradeToCard(trade, id) {
        return (
            <TradeCardWrapper key={id}
                web3={this.props.web3}
                tradeId={id}
                trade={trade}
                reloadCallback={this.getAllTrades.bind(this)}
             />
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

    toggleShowInvalid() {
        this.setState({
            hideInactive: !this.state.hideInactive
        })
    }

    toggleOnlyInvolved() {
        this.setState({
            showOnlyInvolved: !this.state.showOnlyInvolved
        })
    }

    render() {
        return (
            <div>
                {
                    this.state.trades.length > 0
                    ? <div>
                        <Row>
                        <Col sm={{ size: 'auto', offset: 1 }}>
                            <Label check>
                            <Input type="checkbox" onClick={this.toggleShowInvalid.bind(this)}/>{' '}
                                Hide inactive
                            </Label>
                        </Col>
                        <Col sm={{ size: 'auto', offset: 1 }}>
                            <Label check>
                            <Input type="checkbox" onClick={this.toggleOnlyInvolved.bind(this)}/>{' '}
                                Only your trades
                            </Label>
                        </Col>
                        </Row>

                        <br/>

                        <CardColumns> {this.displayTrades()}  </CardColumns>
                      </div>
                    : <div>No trades found.</div>
                }
            </div>
        );
    }
}

export default BrowseTrades
