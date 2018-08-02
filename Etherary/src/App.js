import React, { Component } from 'react'
import { BrowserRouter, Route, Link } from 'react-router-dom';

import EtheraryContract from '../build/contracts/Etherary.json'
import FaucetContract from '../../ERC721Faucet/build/contracts/GenericERC721Token.json'

import getWeb3 from './utils/getWeb3'
import Web3Status from './components/Web3Status'
import BlockchainStatus from './components/BlockchainStatus'
import EventTab from './components/EventTab'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      etheraryAddress: null,
      etheraryInstance: null,
      faucetAddress: null,
      faucetInstance: null,

      tokenNumberInput: -1,
      tokenNumber: -1,
      tokenToSellInput: -1,
      tokenToBuyInput: -1,
    }

    this.handleMint = this.handleMint.bind(this);
    this.handleTokenNumberChange = this.handleTokenNumberChange.bind(this);
    this.handleSubmitTokenNumber = this.handleSubmitTokenNumber.bind(this);
    this.handleTokenToBuyChange = this.handleTokenToBuyChange.bind(this);
    this.handleTokenToSellChange = this.handleTokenToSellChange.bind(this);
    this.handleCreateOffer = this.handleCreateOffer.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
        // TODO: what if these addresses are 0?
        var faucetAddress = FaucetContract.networks[results.web3.version.network].address;
        var faucet = results.web3.eth.contract(FaucetContract.abi);
        var faucetInstance = faucet.at(faucetAddress);

        var etheraryAddress = EtheraryContract.networks[results.web3.version.network].address;
        var etherary = results.web3.eth.contract(EtheraryContract.abi);
        var etheraryInstance = etherary.at(etheraryAddress);

        this.setState({
            web3: results.web3,
            faucetAddress: faucetAddress,
            faucetInstance: faucetInstance,
            etheraryAddress: etheraryAddress,
            etheraryInstance: etheraryInstance
        })
    })
    .catch((e) => {
      console.log('Error finding web3.', e)
    })
  }

  handleTokenToSellChange(event) {
    this.setState({tokenToSellInput: event.target.value});
  }

  handleTokenToBuyChange(event) {
    this.setState({tokenToBuyInput: event.target.value});
  }


  handleCreateOffer() {
      console.log("Creating offer");
      this.state.etheraryInstance.createERC721SellOrder(
          this.state.faucetAddress,
          this.state.tokenToSellInput,
          this.state.tokenToBuyInput,
          {from: this.state.web3.eth.accounts[0], gas:400000}
      )
  }



  handleTokenNumberChange(event) {
    this.setState({tokenNumberInput: event.target.value});
  }

  handleSubmitTokenNumber(event) {
      this.state.faucetInstance.approve(
          this.state.etheraryAddress,
          event.target.value,
          {from: this.state.web3.eth.accounts[0], gas:400000}
      )
      // TODO: only approve offer if this went through
      event.preventDefault();
  }


  handleMint() {
    // Todo wait until gone through
    var mint = this.state.faucetInstance.mint({from: this.state.web3.eth.accounts[0], gas:400000});
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
            <span className="pure-menu-item pure-menu-link">Events</span>
            <span className="pure-menu-heading navbar-right"> <Web3Status web3={this.state.web3}/> </span>
        </nav>

        <main className="container">
            <div className="pure-g">
                <div className="pure-u-1-1">
                    <BlockchainStatus
                        web3={this.state.web3}
                        etheraryAddress={this.state.etheraryAddress}
                        faucetAddress={this.state.faucetAddress}
                    />

                    <h2> Mint a token </h2>
                    <button onClick={this.handleMint} className="pure-button pure-button-primary">Mint</button>

                    <h2> Approve a token </h2>
                    <form className="pure-form">
                    <fieldset>
                        <legend>Enter the token id you want ato approve</legend>
                        <label>
                            {"Token Id: "}
                            <input
                                type="number"
                                className="pure-input-1-8"
                                value={this.state.tokenNumberInput}
                                onChange={this.handleTokenNumberChange}
                            />
                        </label>
                        {
                            this.state.tokenNumberInput >= 0
                            ? <button type="button" onClick={this.handleSubmitTokenNumber} className="pure-button pure-button-primary">Approve</button>
                            : <button type="button" disabled className="pure-button pure-button-primary">Approve</button>
                        }
                    </fieldset>
                    </form>


                    <form className="pure-form">
                    <fieldset>
                        <legend>Enter the token id you want sell</legend>
                        <label>
                            {"Token to Sell: "}
                            <input
                                type="number"
                                className="pure-input-1-8"
                                value={this.state.tokenToSellInput}
                                onChange={this.handleTokenToSellChange}
                            />
                        </label>
                        <label>
                            {"Token to Buy: "}
                            <input
                                type="number"
                                className="pure-input-1-8"
                                value={this.state.tokenToBuyInput}
                                onChange={this.handleTokenToBuyChange}
                            />
                        </label>
                        {
                            this.state.tokenToBuyInput >=0 && this.state.tokenToSellInput >=0
                            ? <button type="button" onClick={this.handleCreateOffer} className="pure-button pure-button-primary">Start Auction</button>
                            : <button type="button" disabled className="pure-button pure-button-primary">Start Auction</button>
                        }
                    </fieldset>
                    </form>
                </div>
              </div>
              <EventTab
                      web3={this.state.web3}
                      faucetInstance={this.state.faucetInstance}
                      etheraryInstance={this.state.etheraryInstance}
                      faucetAddress={this.state.faucetAddress}
              />
        </main>




      </div>
    );
  }
}

export default App
