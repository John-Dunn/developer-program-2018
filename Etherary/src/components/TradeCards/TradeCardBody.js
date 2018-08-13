import React, { Component } from 'react'
import { Card, Button, CardTitle, CardText } from 'reactstrap';

import TradeCardContent from './TradeCardContent';

// Receives props:
// account={this.props.web3.eth.accounts[0]}
// active={this.props.trade[4]}
// tradeId={this.props.tradeId}
// maker={this.props.trade[0]}
// taker={this.props.trade[5]}
// makerTokenId={this.props.trade[2].toNumber()}
// takerTokenId={this.props.trade[3].toNumber()}
// contract={this.props.trade[1]}
// cancelCallback={this.cancelCallback()}

class TradeCardBody extends Component {
    isApprovedToWithdrawMakerToken() {
        return true;
    }

    isApprovedToWithdrawTakerToken() {
        return true;
    }

    isMaker() {
        return this.props.maker === this.props.account;
    }

    isTaker() {
        return this.props.taker === this.props.account;
    }


    cardStyle() {
        return (
            {
                backgroundColor: this.props.active ? '#fff' : '#ddd',
                borderColor: '#333'
            }
        )
    }

    cardButtonRow() {
        // Active trades:
        // Maker can cancel
        if (this.props.active && this.isMaker()) {
            return( <span><br></br><Button onClick={this.props.cancelCallback}> Cancel </Button></span> );
        }

        // Others can fill
        if (this.props.active && !this.isMaker()) {
            return( <span><br></br><Button color="primary" onClick={this.props.tradeCallback}> Trade </Button> </span>);
        }

        // Inactive trades:
        // If maker is approved for own token (propably after cancelling) can withdraw token
        if (!this.props.active && this.isMaker() && this.isApprovedToWithdrawMakerToken()) {
            return( <span><br></br><Button color="primary" onClick={this.props.withdrawMakerCallback}> Withdraw Token {this.props.makerTokenId} </Button> </span>);
        }

        // If maker is approved for other token (probably after trade complete) can withdraw token
        if (!this.props.active && this.isMaker() && this.isApprovedToWithdrawTakerToken()) {
            return( <span><br></br><Button color="primary" onClick={this.props.withdrawTakerCallback}> Withdraw Token {this.props.takerTokenId} </Button> </span>);
        }

        // If taker is approved for maker token (probably after trade complete) can withdraw token
        if (!this.props.active && this.isTaker() && this.isApprovedToWithdrawMakerToken()) {
            return( <span><br></br><Button color="primary" onClick={this.props.withdrawMakerCallback}> Withdraw Token {this.props.makerTokenId} </Button> </span>);
        }

        return;
    }

    cardContent() {
        return (
            <CardText>
                <TradeCardContent
                    account={this.props.account}
                    active={this.props.active}
                    maker={this.props.maker}
                    taker={this.props.taker}
                    makerTokenId={this.props.makerTokenId}
                    takerTokenId={this.props.takerTokenId}
                    contract={this.props.contract}
                />
                {this.cardButtonRow()}
            </CardText>
        )
    }


    render() {
        return (
            <Card body style={this.cardStyle(this.props.active)}>
                <CardTitle>Trade #{this.props.tradeId}</CardTitle>
                {this.cardContent()}
            </Card>
        )
    }
}


export default TradeCardBody
