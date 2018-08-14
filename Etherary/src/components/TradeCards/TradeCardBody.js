import React, { Component } from 'react'
import { Card, Button, CardTitle, CardText } from 'reactstrap';

import TradeCardContent from './TradeCardContent';

import ERC721 from '../../resources/ERC721Basic.json'
import Etherary from '../../../build/contracts/Etherary.json'
import {instantiateContractAt} from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'

// Receives props:
// account={this.props.web3.eth.accounts[0]}
// active={tradeToActive(this.props.trade)}
// tradeId={this.props.tradeId}
// maker={tradeToMaker(this.props.trade)}
// taker={tradeToTaker(this.props.trade)}
// makerTokenId={tradeToMakerTokenId(this.props.trade)}
// takerTokenId={tradeToTakerTokenId(this.props.trade)}
// contract={tradeToContract(this.props.trade)}
// cancelCallback={this.cancelCallback.bind(this)}
// tradeCallback={this.tradeCallback.bind(this)}
// reloadCallback={this.props.reloadCallback}
// makerTokenWithdrawable={this.props.makerTokenWithdrawable}
// takerTokenWithdrawable={this.props.takerTokenWithdrawable}
// web3={this.props.web3}

class TradeCardBody extends Component {

    constructor(props) {
        super(props);
        this.state = {
            withdrawalSuccessful: false
        }
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

    withdrawMaker() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.props.contract);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.transferFrom(etheraryAddress, this.props.account, this.props.makerTokenId, {from: this.props.account, gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                _from: etheraryAddress,
                _to: this.props.account,
                _tokenId: this.props.web3.toBigNumber(this.props.makerTokenId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Withdrawal successful');
                this.setState({
                    withdrawalSuccessful: true
                })
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error withdrawing: ', error);
        });
    }

    withdrawTaker() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.props.contract);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.transferFrom(etheraryAddress, this.props.account, this.props.takerTokenId, {from: this.props.account, gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                _from: etheraryAddress,
                _to: this.props.account,
                _tokenId: this.props.web3.toBigNumber(this.props.takerTokenId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Withdrawal successful');
                this.setState({
                    withdrawalSuccessful: true
                })
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error withdrawing: ', error);
        });
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
        // After cancelling: If maker is approved for own token  can withdraw token
        if (!this.props.active && this.isMaker() && this.props.makerTokenWithdrawable) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawMaker.bind(this)}>
                    Withdraw Token {this.props.makerTokenId}
                    </Button>
                </span>
            );
        }

        // Trade complete (as maker)
        if (!this.props.active && this.isMaker() && this.props.takerTokenWithdrawable) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawTaker.bind(this)}>
                    Withdraw Token {this.props.takerTokenId}
                    </Button>
                </span>
            );
        }

        // If taker is approved for maker token (probably after trade complete) can withdraw token
        if (!this.props.active && this.isTaker() && this.props.makerTokenWithdrawable) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawMaker.bind(this)}>
                    Withdraw Token {this.props.makerTokenId}
                    </Button>
                </span>
            );
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
