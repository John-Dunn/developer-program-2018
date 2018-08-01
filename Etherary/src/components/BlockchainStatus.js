import React, {Component } from 'react'

class BlockchainInfo extends Component {
    render() {
        var web3 = this.props.web3;
        var web3Connected = this.props.web3Connected;
        var account = null;
        var blockNumber = -1;
        var balanceInEth = -1;

        if (web3Connected) {
            account = web3.eth.accounts[0];
            blockNumber = web3.eth.blockNumber;
            var balanceInWei = web3.eth.getBalance(account).toNumber();
            balanceInEth = web3.fromWei(balanceInWei);
        }

        return (
            <div>
                <div className="pure-g">
                    <div className="pure-u-1-2"><p>Account: {account} </p></div>
                    <div className="pure-u-1-4"><p>Balance: {balanceInEth} </p></div>
                    <div className="pure-u-1-4"><p>Block Number: {blockNumber} </p></div>
                </div>
            </div>
        )
    }
}


class BlockchainStatus extends Component {
    render() {
        var web3 = this.props.web3;
        var web3Connected = web3 && web3.isConnected();

        return (
            <div>
                <h2> Blockchain Status </h2>
                {
                    {web3Connected}
                    ? <div>
                        <BlockchainInfo web3={web3} web3Connected={web3Connected}/>
                      </div>
                    : 'Could not query blockchain info: no web3'
                }
            </div>
        )
    }
}

export default BlockchainStatus
