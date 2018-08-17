import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText  } from 'reactstrap';

import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'
import {tradeToMaker, tradeToMakerContract, tradeToTakerContract, tradeToMakerTokenId, tradeToTakerTokenId, tradeToActive, tradeToTaker} from '../../utils/tradeUnpacking'

import TradeCardContent from './TradeCardContent'
import ActiveTradeModal from './ActiveTradeModal'
import InactiveTradeModal from './InactiveTradeModal'

import Etherary from '../../../build/contracts/Etherary.json'
import ERC721 from '../../resources/ERC721Basic.json'


class TradeCardWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
          showActiveTradeModal: false,
          showInactiveTradeModal: false,
          takerTokenOwner: null,

          takerTokenApproved: false,
          makerTokenApproved: false
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


    handleWithdrawModal() {
        this.getTakerTokenOwner();
        this.isTakerTokenApproved(this.props.trade);
        this.isMakerTokenApproved(this.props.trade);
        this.setState({
            showInactiveTradeModal: true
        })
    }

    // Modal handling
    handleCompleteTrade() {
        this.getTakerTokenOwner();
        this.setState({
            showActiveTradeModal: true
        })
    }



    toggleActiveTradeModal() {
        this.setState({
            showActiveTradeModal: !this.state.showActiveTradeModal
        })
    }

    toggleInactiveTradeModal() {
        this.setState({
            showInactiveTradeModal: !this.state.showInactiveTradeModal
        })
    }

    getTakerTokenOwner() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToTakerContract(this.props.trade));
        ERC721Instance.ownerOf(tradeToTakerTokenId(this.props.trade))
        .then(function(owner) {
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
        if (!tradeToActive(this.props.trade) && (this.isMaker() || this.isTaker())) {
            return(
                <span className="centered"><br></br>
                    <Button onClick={() => {this.handleWithdrawModal()}} color="primary">
                        Check whether you can withdraw.
                    </Button>
                </span>
            );
        }
        return;
    }


    isTakerTokenApproved(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToTakerContract(trade));
        ERC721Instance.getApproved(tradeToTakerTokenId(trade))
        .then(function(approved) {
            var isApproved = this.props.web3.eth.accounts[0] === approved;
            this.setState({takerTokenApproved: isApproved});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying approval failed: ", err);
        })
    }

    isMakerTokenApproved(trade) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToMakerContract(trade));
        ERC721Instance.getApproved(tradeToMakerTokenId(trade))
        .then(function(approved) {
            var isApproved = this.props.web3.eth.accounts[0] === approved;
            this.setState({makerTokenApproved: isApproved});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying approval failed: ", err);
        })
    }



    render() {
        return (
            <div>

                <Card body style={this.cardStyle(tradeToActive(this.props.trade))}>
                    <CardTitle>Trade #{this.props.tradeId}</CardTitle>
                    {this.cardContent()}
                </Card>

                <ActiveTradeModal
                    show={this.state.showActiveTradeModal}
                    toggleCallback={this.toggleActiveTradeModal.bind(this)}
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

                <InactiveTradeModal
                    trade={this.props.trade}
                    show={this.state.showInactiveTradeModal}
                    toggleCallback={this.toggleInactiveTradeModal.bind(this)}
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
                    makerTokenApproved={this.state.makerTokenApproved}
                    takerTokenApproved={this.state.takerTokenApproved}
                />
            </div>

        );
    }

};


export default TradeCardWrapper;
