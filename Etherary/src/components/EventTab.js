import React, {Component} from 'react'
import EventList from './EventList'

class EventTab extends Component {

    constructor(props) {
      super(props)

      this.state = {
          web3: null,
          contractAddressInput: '',
          faucetEvents: [],
          etheraryEvents: []
      }

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmitContract = this.handleSubmitContract.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Typical usage (don't forget to compare props):
        if (this.props.web3 !== prevProps.web3) {
            this.setState({web3: this.props.web3});
            this.etheraryEventListener();
        }
    }


    handleChange(event) {
        this.setState({contractAddressInput: event.target.value});
    }

    handleSubmitContract(event) {
        if (this.state.web3.isAddress(this.state.contractAddressInput)) {
            console.log('A contract was submitted: ' + this.state.contractAddressInput);
            this.setState({faucetEvents: []})
            this.faucetEventListener(this.state.contractAddressInput)
        }
        event.preventDefault();
    }

    faucetEventListener(address) {
      console.log("Listening for Faucet Events")
      var event = this.props.faucetInstance.allEvents({
          fromBlock: 0,
          toBlock: 'latest'
      });
      event.watch(function(error,log) {
          this.setState({faucetEvents: this.state.faucetEvents.concat(log)});
      }.bind(this))
    }

    etheraryEventListener() {
      console.log("Listening for Etherary Events")
      this.setState({etheraryEvents: []});
      var event = this.props.etheraryInstance.allEvents({
          fromBlock: 0,
          toBlock: 'latest'
      });

      event.watch(function(error,log) {
          this.setState({etheraryEvents: this.state.etheraryEvents.concat(log)});
      }.bind(this))
    }

    render() {
        return(
            <div>
                <h2> Read contract events </h2>
                <form className="pure-form" onSubmit={this.handleSubmitContract}>
                <fieldset>
                    <legend>Enter a contract address to check all events from that address (e.g. token transfers). GET721 is at {this.props.faucetAddress}.</legend>
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
                <EventList events={this.state.faucetEvents} />
                <EventList events={this.state.etheraryEvents} />
            </div>
        )
    }

}


export default EventTab
