import React, { Component } from 'react'

class Web3Status extends Component {
    render() {
        var web3 = this.props.web3;

        if (!this.props.web3Connected) {
            return (<div> No Web3 Connection </div>);
        }

        if (web3.currentProvider.isMetaMask){
            return (<div> <font size="2">Web3 Connection via Metamask {web3.eth.accounts[0]}</font></div>);
        } else {
            return (<div> <font size="2">Web3 Connection via {web3.currentProvider.host}</font></div>);
        }
    }
}

export default Web3Status
