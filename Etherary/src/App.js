import React, { Component } from 'react'
import EtheraryContract from '../build/contracts/Etherary.json'
import ERC721BasicContract from '../../ERC721Faucet/build/contracts/GenericERC721Token.json'


import getWeb3 from './utils/getWeb3'
import Web3Status from './components/Web3Status'
import BlockchainStatus from './components/BlockchainStatus'
import EventList from './components/EventList'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      contractAddressInput: '',
      contractAddress: '',

      events: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitContract = this.handleSubmitContract.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
      //this.testFaucet()
      //this.eventListener()
    })
    .catch((e) => {
      console.log('Error finding web3.', e)
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract')
    const etherary = contract(EtheraryContract)
    etherary.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions
    var etheraryInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      etherary.deployed()
      .then((instance) => {
        etheraryInstance = instance
        return etheraryInstance.idToSellOrder.call(0, {from: accounts[0]})
      }).then((result) => {
        // Update state with the result.
        console.log("Etherary: ", result)
        return
      }).catch((e) => {
        console.log('Error: Contract not deployed', e)
      })
    })
  }

  // testFaucet() {
  //   const contract = require('truffle-contract')
  //   const faucet = contract(ERC721BasicContract)
  //   faucet.setProvider(this.state.web3.currentProvider)
  //
  //   // Declaring this for later so we can chain functions
  //   var faucetInstance
  //
  //   // Get accounts.
  //   this.state.web3.eth.getAccounts((error, accounts) => {
  //     faucet.deployed()
  //     .then((instance) => {
  //       faucetInstance = instance
  //       console.log(faucetInstance)
  //       return faucetInstance.mint(0, {from: accounts[0], gas:400000})
  //     }).then((result) => {
  //       // Update state with the result.
  //       console.log("Faucet: ", result)
  //       return
  //     }).catch((e) => {
  //       console.log('Error: Contract not deployed', e)
  //     })
  //   })
  // }


  handleChange(event) {
    this.setState({contractAddressInput: event.target.value});
  }

  handleSubmitContract(event) {
    if (this.state.web3.isAddress(this.state.contractAddressInput)) {
        this.setState({contractAddress: this.state.contractAddressInput});
        console.log('A contract was submitted: ' + this.state.contractAddressInput);
        this.setState({events: []})
        this.eventListener(this.state.contractAddressInput)
    }
    event.preventDefault();
  }


  eventListener(address) {
      console.log("Listening for Events")
      var ERC721Basic = this.state.web3.eth.contract(ERC721BasicContract.abi);
      var ERC721BasicInstance = ERC721Basic.at(address);
      var event = ERC721BasicInstance.allEvents({
          fromBlock: 0,
          toBlock: 'latest'
      });

      event.watch(function(error,log) {
          this.setState({events: this.state.events.concat(log)});
      }.bind(this)
    )
  }



  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
            <span className="pure-menu-heading navbar-right"> <Web3Status web3={this.state.web3}/> </span>
        </nav>

        <main className="container">
            <div className="pure-g">
                <div className="pure-u-1-1">
                    <BlockchainStatus web3={this.state.web3} events={this.state.events} />
                    <h2> Read contract events </h2>
                    <form className="pure-form" onSubmit={this.handleSubmitContract}>
                    <fieldset>
                        <legend>Enter a contract address to check all events from that address (e.g. token transfers). GET721 is at 0x238c5edd870b2048625f4bf0bbbb981e434db37d</legend>
                        <label>
                            {"Token Contract: "}
                            <input
                                type="text"
                                placeholder="0x8bc..."
                                className="pure-input-1-2"
                                value={this.state.contractAddressInput}
                                onChange={this.handleChange}
                            />
                        </label>
                        {
                            this.state.web3 && this.state.web3.isAddress(this.state.contractAddressInput)
                            ? <button className="pure-button pure-button-primary">Read Events</button>
                            : <button disabled className="pure-button pure-button-primary">Read Events</button>
                        }
                    </fieldset>
                    </form>
                    <div>
                        {
                            this.state.contractAddress
                            ? <EventList events={this.state.events} />
                            : ''
                        }
                    </div>
                </div>
              </div>
        </main>
      </div>
    );
  }
}

export default App
