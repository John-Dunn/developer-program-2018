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


    makerTokenLine() {
        return (<span><strong>Token Offered:</strong> <br></br>  #{this.props.makerTokenId} from ERC721 contract {this.props.makerContract}. <br></br></span>)
    }

    takerTokenLine() {
        return (<span><strong>Token Wanted:</strong> <br></br>  #{this.props.takerTokenId} from ERC721 contract {this.props.takerContract}. <br></br></span>)
    }

    makerLine() {
        return (
            <span> <strong>Maker: </strong>{this.isMaker() ? <font color="#0077ff"> <strong>You</strong> </font> : this.props.maker}  <br></br></span>
        )
    }

    takerLine() {
        if (!this.isTradeCompleted()) {
            return;
        }

        return (
            <span> <strong>Taker: </strong>{this.isTaker() ? <font color="#0077ff"> <strong>You</strong> </font> : this.props.taker}  <br></br></span>
        )
    }

    statusLine() {
        if (this.props.active) {
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
