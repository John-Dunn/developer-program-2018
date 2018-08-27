import React, { Component } from 'react'
import {
    tradeToMaker,
    tradeToMakerContract,
    tradeToTakerContract,
    tradeToIsMakerContractERC20,
    tradeToIsTakerContractERC20,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../../utils/tradeUnpacking'

// Presents data for modals and trade cards
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
        return (<span><strong>Token Offered:</strong> <br></br>
            {tradeToIsMakerContractERC20(this.props.trade)
             ? <span> {this.props.web3.fromWei(tradeToMakerTokenId(this.props.trade), "ether")} from ERC20 contract {tradeToMakerContract(this.props.trade)}. </span>
             : <span> #{tradeToMakerTokenId(this.props.trade)} from ERC721 contract {tradeToMakerContract(this.props.trade)}. </span>
            }
        <br></br></span>)
    }

    takerTokenLine() {
        return (<span><strong>Token Wanted:</strong> <br></br>
            {tradeToIsTakerContractERC20(this.props.trade)
             ? <span> {this.props.web3.fromWei(tradeToTakerTokenId(this.props.trade), "ether")} from ERC20 contract {tradeToTakerContract(this.props.trade)}. </span>
             : <span> #{tradeToTakerTokenId(this.props.trade)} from ERC721 contract {tradeToTakerContract(this.props.trade)}. </span>
            }
        <br></br></span>)
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
