import React, {Component} from 'react';
import { Card, Button, CardTitle, CardText  } from 'reactstrap';

// Custom Components
import TradeCardContent from './TradeCardContent'
import ActiveTradeModal from './ActiveTradeModal'
import InactiveTradeModal from './InactiveTradeModal'

// Utils
import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import didEventOccur from '../../utils/didEventOccur'
import {
    tradeToMaker,
    tradeToMakerContract,
    tradeToTakerContract,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../../utils/tradeUnpacking'

// Contracts 
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

    // Inactive Trade Modal
    handleInactiveTradeModal() {
        this.isTokenApproved(this.props.trade, true);
        this.isTokenApproved(this.props.trade, false);
        this.setState({
            showInactiveTradeModal: true
        })
    }

    toggleInactiveTradeModal() {
        this.setState({
            showInactiveTradeModal: !this.state.showInactiveTradeModal
        })
    }

    isTokenApproved(trade, isMaker) {
        var address = isMaker ? tradeToMakerContract(trade) : tradeToTakerContract(trade);
        var tokenId = isMaker ? tradeToMakerTokenId(trade) : tradeToTakerTokenId(trade);

        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, address);

        ERC721Instance.getApproved(tokenId)
        .then(function(approved) {
            var isApproved = this.props.web3.eth.accounts[0] === approved;
            var newState = isMaker ? {makerTokenApproved: isApproved} : {takerTokenApproved: isApproved};
            this.setState(newState);
        }.bind(this))
        .catch(function(err) {
            console.log("Querying approval failed: ", err);
        })
    }


    // Active Trade Modal
    handleTradeModal() {
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



    // Button onClick
    handleCancelTrade() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.cancelERC721Trade(this.props.tradeId, {from:this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = { tradeId: this.props.web3.toBigNumber(this.props.tradeId) }
            if(didEventOccur(txid, expectedEvent)) {
                console.log('Trade cancelled');
                this.props.reloadCallback();
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error cancelling: ', error);
        });
    }


    // Button Row
    isMaker() {
        return tradeToMaker(this.props.trade) === this.props.web3.eth.accounts[0];
    }

    isTaker() {
        return tradeToTaker(this.props.trade) === this.props.web3.eth.accounts[0];
    }

    cardButtonRow() {
        // Active trades:
        // Maker can cancel
        if (tradeToActive(this.props.trade) && this.isMaker()) {
            return( <span><br></br><Button onClick={() => {this.handleCancelTrade()}}> Cancel </Button></span> );
        }

        // Others can fill
        if (tradeToActive(this.props.trade) && !this.isMaker()) {
            return( <span><br></br><Button color="primary" onClick={() => {this.handleTradeModal()}}> Trade </Button> </span>);
        }

        // Inactive trades:
        // After cancelling: If maker is approved for own token  can withdraw token
        if (!tradeToActive(this.props.trade) && (this.isMaker() || this.isTaker())) {
            return(
                <span className="centered"><br></br>
                    <Button onClick={() => {this.handleInactiveTradeModal()}} color="primary">
                        Check whether you can withdraw.
                    </Button>
                </span>
            );
        }
        return;
    }


    // Render helper
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
                    trade={this.props.trade}
                />
                {this.cardButtonRow()}
            </CardText>
        )
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
                    trade={this.props.trade}
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
