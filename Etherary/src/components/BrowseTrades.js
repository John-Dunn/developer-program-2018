import React, { Component } from 'react'
import EtheraryContract from '../../build/contracts/Etherary.json'

class BrowseTrades extends Component {
    instantiate(web3, abi, address) {
        var contract = web3.eth.contract(abi);
        return contract.at(address)
    }

    contractAddress(web3, contract) {
        return contract.networks[web3.version.network].address;
    }





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
        var EtheraryInstance = this.instantiate(this.props.web3, EtheraryContract.abi, this.contractAddress(this.props.web3, EtheraryContract));
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

    displayTrade() {
        if (this.state.trade == null) {
            return(<div></div>);
        }
        if (this.state.trade != null && this.state.trade[0] == '0x0000000000000000000000000000000000000000') {
            return(<div>Trade not found.</div>);
        }
        return(
            <div>
                <div>
                    The trade with ID <strong>{this.state.orderId}</strong> was created by <strong>{this.state.trade[0]}</strong> and
                    is <strong>{this.state.trade[4] ? 'active' : 'inactive'}</strong>.
                </div>
                <div>
                    The ERC721 token contract is <strong>{this.state.trade[1]}</strong> and token <strong>{this.state.trade[2].toNumber()}</strong> is
                    to be traded for token <strong>{this.state.trade[3].toNumber()}</strong>.
                </div>
            </div>
        )
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
                {this.displayTrade()}
            </div>

        );
    }
}

export default BrowseTrades
