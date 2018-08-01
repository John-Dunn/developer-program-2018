import React, { Component } from 'react'

class Web3Status extends Component {
    render() {
        var web3 = this.props.web3;
        var isConnected = web3 && web3.isConnected()

        if (!isConnected) {
            return (<div> No Web3 Connection </div>);
        }

        if (web3.currentProvider.isMetaMask){
            return (<div> Web3 Connection via Metamask</div>);
        } else {
            return (<div> Web3 Connection via {web3.currentProvider.host}</div>);
        }
    }
}

export default Web3Status
