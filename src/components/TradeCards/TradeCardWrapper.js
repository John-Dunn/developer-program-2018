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
    tradeToIsMakerContractERC20,
    tradeToIsTakerContractERC20,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../../utils/tradeUnpacking'

// Contracts
import Etherary from '../../../build/contracts/Etherary.json'
import ERC721 from '../../resources/ERC721Basic.json'
import ERC20 from '../../resources/ERC20Basic.json'


// Main trade card component, uses modals and the card contant 
class TradeCardWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showActiveTradeModal: false,
            showInactiveTradeModal: false,
            ownsTakerToken: null,

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
        if (isMaker && tradeToIsMakerContractERC20(trade)) {
            this.isTokenApprovedERC20(trade, true);
        }

        if (isMaker && !tradeToIsMakerContractERC20(trade)) {
            this.isTokenApprovedERC721(trade, true);
        }

        if (!isMaker && tradeToIsTakerContractERC20(trade)) {
            this.isTokenApprovedERC20(trade, false);
        }

        if (!isMaker && !tradeToIsTakerContractERC20(trade)) {
            this.isTokenApprovedERC721(trade, false);
        }
    }

    isTokenApprovedERC721(trade, isMaker) {
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

    isTokenApprovedERC20(trade, isMaker) {
        var address = isMaker ? tradeToMakerContract(trade) : tradeToTakerContract(trade);
        var tokenId = isMaker ? tradeToMakerTokenId(trade) : tradeToTakerTokenId(trade);

        var instance = instantiateContractAt(ERC20, this.props.web3, address);
        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        var account = this.props.web3.eth.accounts[0];

        instance.allowance(etheraryAddress, account)
        .then(function(allowance) {
            console.log("Allowance: ", allowance.toNumber());
            var isApproved = (allowance.toNumber() >= (isMaker ? tradeToMakerTokenId(trade) : tradeToTakerTokenId(trade)));
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
        if (tradeToIsTakerContractERC20(this.props.trade)) {
            this.getTakerTokenOwnerERC20()
        }

        if (!tradeToIsTakerContractERC20(this.props.trade)) {
            this.getTakerTokenOwnerERC721()
        }
    }

    getTakerTokenOwnerERC721() {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToTakerContract(this.props.trade));
        ERC721Instance.ownerOf(tradeToTakerTokenId(this.props.trade))
        .then(function(owner) {
            this.setState({ownsTakerToken: owner === this.props.web3.eth.accounts[0]});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        })
    }

    getTakerTokenOwnerERC20() {
        var instance = instantiateContractAt(ERC20, this.props.web3, tradeToTakerContract(this.props.trade));
        instance.balanceOf(this.props.web3.eth.accounts[0])
        .then(function(balance) {
            console.log("Balance:", balance.toNumber());
            this.setState({ownsTakerToken: balance.toNumber() >= tradeToTakerTokenId(this.props.trade)});
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
        })
    }

    // Button onClick
    handleCancelTrade() {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);
        EtheraryInstance.cancelTrade(this.props.tradeId, {from:this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = { _tradeId: this.props.web3.toBigNumber(this.props.tradeId) }
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
                    web3={this.props.web3}
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
                    ownsTakerToken={this.state.ownsTakerToken}
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
