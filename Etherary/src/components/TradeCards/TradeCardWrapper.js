import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText  } from 'reactstrap';

import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'
import {tradeToMaker, tradeToMakerContract, tradeToTakerContract, tradeToMakerTokenId, tradeToTakerTokenId, tradeToActive, tradeToTaker} from '../../utils/tradeUnpacking'

import TradeCardContent from './TradeCardContent'
import TradeModal from './TradeModal'

import Etherary from '../../../build/contracts/Etherary.json'
import ERC721 from '../../resources/ERC721Basic.json'


class TradeCardWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
          showTradeModal: false,
          takerTokenOwner: null,
          withdrawalSuccessful: false
        };
    }

    handleCancelTrade() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.cancelERC721Trade(this.props.tradeId, {from:this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                tradeId: this.props.web3.toBigNumber(this.props.tradeId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Trade cancelled');
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error cancelling: ', error);
        });
    }


    // Modal handling
    handleCompleteTrade() {
        this.getTakerTokenOwner();
        this.setState({
            showTradeModal: true
        })
    }

    toggleTradeModal() {
        this.setState({
            showTradeModal: !this.state.showTradeModal
        })
    }

    getTakerTokenOwner() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToTakerContract(this.props.trade));
        ERC721Instance.ownerOf(tradeToTakerTokenId(this.props.trade))
        .then(function(owner) {
            console.log("Token owner: ", owner);
            this.setState({takerTokenOwner: owner});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        })
    }


/// NEW

    isMaker() {
        return tradeToMaker(this.props.trade) === this.props.web3.eth.accounts[0];
    }

    isTaker() {
        return tradeToTaker(this.props.trade) === this.props.web3.eth.accounts[0];
    }

    cardStyle(isActive) {
        return (
            {
                backgroundColor: isActive ? '#fff' : '#ddd',
                borderColor: '#333'
            }
        )
    }

    cardContent() {
        return (
            <CardText>
                <TradeCardContent
                    account={this.props.web3.eth.accounts[0]}
                    active={tradeToActive(this.props.trade)}
                    maker={tradeToMaker(this.props.trade)}
                    taker={tradeToTaker(this.props.trade)}
                    makerTokenId={tradeToMakerTokenId(this.props.trade)}
                    takerTokenId={tradeToTakerTokenId(this.props.trade)}
                    makerContract={tradeToMakerContract(this.props.trade)}
                    takerContract={tradeToTakerContract(this.props.trade)}
                />
                {this.cardButtonRow()}
            </CardText>
        )
    }

    cardButtonRow() {
        // Active trades:
        // Maker can cancel
        if (tradeToActive(this.props.trade) && this.isMaker()) {
            return( <span><br></br><Button onClick={() => {this.handleCancelTrade()}}> Cancel </Button></span> );
        }

        // Others can fill
        if (tradeToActive(this.props.trade) && !this.isMaker()) {
            return( <span><br></br><Button color="primary" onClick={() => {this.handleCompleteTrade()}}> Trade </Button> </span>);
        }

        // Inactive trades:
        // After cancelling: If maker is approved for own token  can withdraw token
        if (!tradeToActive(this.props.trade) && this.isMaker() && (this.props.makerTokenWithdrawable || this.state.withdrawalSuccessful)) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawMaker.bind(this)}>
                    Withdraw Token {tradeToMakerTokenId(this.props.trade)}
                    </Button>
                </span>
            );
        }

        // Trade complete (as maker)
        if (!tradeToActive(this.props.trade) && this.isMaker() && (this.props.takerTokenWithdrawable || this.state.withdrawalSuccessful)) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawTaker.bind(this)}>
                    Withdraw Token {tradeToTakerTokenId(this.props.trade)}
                    </Button>
                </span>
            );
        }

        // If taker is approved for maker token (probably after trade complete) can withdraw token
        if (!tradeToActive(this.props.trade) && this.isTaker() && (this.props.makerTokenWithdrawable || this.state.withdrawalSuccessful)) {
            return(
                <span><br></br>
                    <Button
                        disabled={this.state.withdrawalSuccessful}
                        color={this.state.withdrawalSuccessful ? "success" : "primary"}
                        onClick={this.withdrawMaker.bind(this)}>
                    Withdraw Token {tradeToMakerTokenId(this.props.trade)}
                    </Button>
                </span>
            );
        }

        return;
    }

    withdrawToken(tokenId, tokenContract) {
        var account = this.props.web3.eth.accounts[0];
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tokenContract);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.transferFrom(etheraryAddress, account, tokenId, {from: account, gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                _from: etheraryAddress,
                _to: account,
                _tokenId: this.props.web3.toBigNumber(tokenId)
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

    withdrawMaker() {
        this.withdrawToken(tradeToMakerTokenId(this.props.trade), tradeToMakerContract(this.props.trade));
    }

    withdrawTaker() {
        this.withdrawToken(tradeToTakerTokenId(this.props.trade), tradeToTakerContract(this.props.trade));
    }


    render() {
        return (
            <div>

                <Card body style={this.cardStyle(tradeToActive(this.props.trade))}>
                    <CardTitle>Trade #{this.props.tradeId}</CardTitle>
                    {this.cardContent()}
                </Card>

                <TradeModal
                    show={this.state.showTradeModal}
                    toggleCallback={this.toggleTradeModal.bind(this)}
                    tradeId={this.props.tradeId}
                    account={this.props.web3.eth.accounts[0]}
                    active={tradeToActive(this.props.trade)}
                    maker={tradeToMaker(this.props.trade)}
                    taker={tradeToTaker(this.props.trade)}
                    makerTokenId={tradeToMakerTokenId(this.props.trade)}
                    takerTokenId={tradeToTakerTokenId(this.props.trade)}
                    makerContract={tradeToMakerContract(this.props.trade)}
                    takerContract={tradeToTakerContract(this.props.trade)}
                    takerTokenOwner={this.state.takerTokenOwner}
                    web3={this.props.web3}
                    reloadCallback={this.props.reloadCallback}
                />
            </div>

        );
    }

};
// <TradeCardBody
//     account={this.props.web3.eth.accounts[0]}
//     active={tradeToActive(this.props.trade)}
//     tradeId={this.props.tradeId}
//     maker={tradeToMaker(this.props.trade)}
//     taker={tradeToTaker(this.props.trade)}
//     makerTokenId={tradeToMakerTokenId(this.props.trade)}
//     takerTokenId={tradeToTakerTokenId(this.props.trade)}
//     contract={tradeToContract(this.props.trade)}
//     cancelCallback={this.cancelCallback.bind(this)}
//     tradeCallback={this.tradeCallback.bind(this)}
//     reloadCallback={this.props.reloadCallback.bind(this)}
//     makerTokenWithdrawable={this.props.makerTokenWithdrawable}
//     takerTokenWithdrawable={this.props.takerTokenWithdrawable}
//     web3={this.props.web3}
// />

export default TradeCardWrapper;
