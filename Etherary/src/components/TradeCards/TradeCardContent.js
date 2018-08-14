import React, { Component } from 'react'

// Receives props:
// account={this.props.web3.eth.accounts[0]}
// active={this.props.trade[4]}
// maker={this.props.trade[0]}
// taker={this.props.trade[5]}
// makerTokenId={this.props.trade[2].toNumber()}
// takerTokenId={this.props.trade[3].toNumber()}
// contract={this.props.trade[1]}

class TradeCardContent extends Component {

    isMaker() {
        return this.props.maker === this.props.account;
    }

    isTaker() {
        return this.props.taker === this.props.account;
    }

    isTradeCancelled() {
        return !this.props.active && this.props.taker === '0x0000000000000000000000000000000000000000';
    }

    isTradeCompleted() {
        return !this.props.active && this.props.taker !== '0x0000000000000000000000000000000000000000'
    }


    // Card content
    contractLine() {
        return (<span>ERC721 token contract: <strong>{this.props.contract}</strong> <br></br> </span>);
    }

    offerLine() {
        return (<span>Offers: <strong>Token #{this.props.makerTokenId}</strong> Wants: <strong>Token #{this.props.takerTokenId}</strong> <br></br></span>)
    }

    makerLine() {
        return (
            <span> Maker: <strong>{this.isMaker() ? <font color="#0077ff"> You </font> : this.props.maker}</strong>  <br></br></span>
        )
    }

    takerLine() {
        if (!this.isTradeCompleted()) {
            return;
        }

        return (
            <span> Taker: <strong>{this.isTaker() ? <font color="#0077ff"> You </font> : this.props.taker}</strong>  <br></br></span>
        )
    }

    statusLine() {
        if (this.props.active) {
            return (<span> Status: <strong> Active </strong> <br></br></span>);
        }

        if (this.isTradeCancelled()) {
            return (<span> Status: <strong> Cancelled </strong> <br></br></span>);
        }

        if (this.isTradeCompleted()) {
            return (<span> Status: <strong> Completed </strong> <br></br></span>);
        }

    }

    render() {
        return (
            <font size="2">
                {this.contractLine()}
                {this.offerLine()}
                {this.makerLine()}
                {this.takerLine()}
                {this.statusLine()}
            </font>
        )
    }
}


export default TradeCardContent
