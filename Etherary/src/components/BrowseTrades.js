import React, { Component } from 'react'
import EtheraryContract from '../../build/contracts/Etherary.json'
import ContractUtils from '../utils/contractUtils'
import TradeCard from './TradeCard'

class BrowseTrades extends Component {

    constructor(props) {
        super(props);
        this.state = {
            orderIdInput: -1,
            orderId: -1,
            trade: null
        }

        this.handleTradeIdChange = this.handleTradeIdChange.bind(this);
        this.handleTradeLookup = this.handleTradeLookup.bind(this);
    }

    handleTradeIdChange(event) {
      this.setState({
          orderIdInput: event.target.value
      });
    }

    handleTradeLookup(event) {
        var etheraryAddress = ContractUtils.getContractAddress(this.props.web3, EtheraryContract);
        var EtheraryInstance = ContractUtils.getContractInstance(this.props.web3, EtheraryContract.abi, etheraryAddress);
        try {
            var trade = EtheraryInstance.idToSellOrder(this.state.orderIdInput);
            this.setState({
                orderId: this.state.orderIdInput,
                trade: trade
            });
        } catch(e) {
            console.log("Checking ownership failed: ", e);
        }
        event.preventDefault();
    }


    render() {
        return (
            <div>
                <h2> You can browse trades here!</h2>
                <form className="pure-form">
                    <fieldset>
                        <legend>Specify the ID of the trade you want to look up.</legend>
                        <label> {"Trade ID: "}
                            <input
                                className="pure-u-1-8"
                                type="number"
                                placeholder="123"
                                onChange={this.handleTradeIdChange}
                            />
                        </label>

                        <button
                            className="pure-button pure-button-primary"
                            onClick={this.handleTradeLookup}
                        >
                                Lookup Trade
                        </button>
                    </fieldset>
                </form>
                {
                    this.state.trade !== null
                    ? <TradeCard orderId={this.state.orderId} trade={this.state.trade}/>
                    : <div></div>
                }
            </div>

        );
    }
}

export default BrowseTrades
