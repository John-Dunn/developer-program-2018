import React, { Component } from 'react'
import {
    tradeToMaker,
    tradeToMakerContract,
    tradeToTakerContract,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../../utils/tradeUnpacking'


class TradeCardContent extends Component {

    isMaker() {
        return tradeToMaker(this.props.trade) === this.props.account;
    }

    isTaker() {
        return tradeToTaker(this.props.trade) === this.props.account;
    }

    isTradeCancelled() {
        return !tradeToActive(this.props.trade) && tradeToTaker(this.props.trade) === '0x0000000000000000000000000000000000000000';
    }

    isTradeCompleted() {
        return !tradeToActive(this.props.trade) && tradeToTaker(this.props.trade) !== '0x0000000000000000000000000000000000000000'
    }


    makerTokenLine() {
        return (<span><strong>Token Offered:</strong> <br></br>  #{tradeToMakerTokenId(this.props.trade)} from ERC721 contract {tradeToMakerContract(this.props.trade)}. <br></br></span>)
    }

    takerTokenLine() {
        return (<span><strong>Token Wanted:</strong> <br></br>  #{tradeToTakerTokenId(this.props.trade)} from ERC721 contract {tradeToTakerContract(this.props.trade)}. <br></br></span>)
    }

    makerLine() {
        return (
            <span> <strong>Maker: </strong>{this.isMaker() ? <font color="#0077ff"> <strong>You</strong> </font> : tradeToMaker(this.props.trade)}  <br></br></span>
        )
    }

    takerLine() {
        if (!this.isTradeCompleted()) {
            return;
        }

        return (
            <span> <strong>Taker: </strong>{this.isTaker() ? <font color="#0077ff"> <strong>You</strong> </font> : tradeToTaker(this.props.trade)}  <br></br></span>
        )
    }

    statusLine() {
        if (tradeToActive(this.props.trade)) {
            return (<span> <strong>Status:</strong>  Active  <br></br></span>);
        }

        if (this.isTradeCancelled()) {
            return (<span> <strong>Status:</strong> Cancelled  <br></br></span>);
        }

        if (this.isTradeCompleted()) {
            return (<span> <strong>Status:</strong> Completed  <br></br></span>);
        }

    }

    render() {
        return (
            <font size="2">
                {this.makerTokenLine()}
                {this.takerTokenLine()}
                {this.makerLine()}
                {this.takerLine()}
                {this.statusLine()}
            </font>
        )
    }
}


export default TradeCardContent
