import React, { Component } from 'react'
import { FormGroup, Col, Button } from 'reactstrap';

import {getContractInstance} from '../utils/getContractInstance'
import getLogs from '../utils/getLogs'

import ERC721FaucetA from '../../build/contracts/GenericERC721TokenA.json'
import ERC721FaucetB from '../../build/contracts/GenericERC721TokenB.json'

import ERC20FaucetA from '../../build/contracts/GenericERC20TokenA.json'
import ERC20FaucetB from '../../build/contracts/GenericERC20TokenB.json'


//Props: web3, web3Connected

class Testing extends Component {
    // Lifecycle methods
    constructor(props) {
        super(props);

        this.state = {
            faucetInstanceA: null,
            faucetAddressA: null,
            tokenBalanceA: null,
            tokenOwnedA: [],
            justMintedA: false,
            latestMintedTokenA: null,

            faucetInstanceB: null,
            faucetAddressB: null,
            tokenBalanceB: null,
            tokenOwnedB: [],
            justMintedB: false,
            latestMintedTokenB: null,

            faucetInstanceC: null,
            faucetAddressC: null,
            tokenBalanceC: null,
            justMintedC: false,

            faucetInstanceD: null,
            faucetAddressD: null,
            tokenBalanceD: null,
            justMintedD: false,

            account: null
        }
    }

    getAllToken(instance) {
        instance.totalSupply()
        .then(function(result) {
            console.log("Supply: ", result);
        })
    }

    componentDidMount() {
        if( this.props.web3Connected) {
            this.startup();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.web3 !== prevProps.web3) {
            console.log("Web3 change: ", this.props.web3)
            this.startup();
        }
    }

    // Tools
    instantiateContracts() {
        var faucetAddressA = ERC721FaucetA.networks[this.props.web3.version.network].address;
        var faucetInstanceA = getContractInstance(ERC721FaucetA, this.props.web3);

        var faucetAddressB = ERC721FaucetB.networks[this.props.web3.version.network].address;
        var faucetInstanceB = getContractInstance(ERC721FaucetB, this.props.web3);

        var faucetAddressC = ERC20FaucetA.networks[this.props.web3.version.network].address;
        var faucetInstanceC = getContractInstance(ERC20FaucetA, this.props.web3);

        var faucetAddressD = ERC20FaucetB.networks[this.props.web3.version.network].address;
        var faucetInstanceD = getContractInstance(ERC20FaucetB, this.props.web3);

        this.setState({
            faucetInstanceA: faucetInstanceA,
            faucetAddressA: faucetAddressA,

            faucetInstanceB: faucetInstanceB,
            faucetAddressB: faucetAddressB,

            faucetInstanceC: faucetInstanceC,
            faucetAddressC: faucetAddressC,

            faucetInstanceD: faucetInstanceD,
            faucetAddressD: faucetAddressD
        })
        return [faucetInstanceA, faucetInstanceB, faucetInstanceC, faucetInstanceD];
    }


    fetchTokenA(tokenOwner, account) {
        var tokensOwnedByAccount = [];
        for (var i = 0; i < tokenOwner.length; i++) {
            if (tokenOwner[i] === account) {
                tokensOwnedByAccount.push(i);
            }
        }
        this.setState({
            tokenOwnedA: tokensOwnedByAccount
        })
    }

    fetchTokenB(tokenOwner, account) {
        var tokensOwnedByAccount = [];
        for (var i = 0; i < tokenOwner.length; i++) {
            if (tokenOwner[i] === account) {
                tokensOwnedByAccount.push(i);
            }
        }
        this.setState({
            tokenOwnedB: tokensOwnedByAccount
        })
    }


    startup() {
        var account = this.props.web3.eth.accounts[0];
        this.setState({
            account: account
        });
        var faucets = this.instantiateContracts();
        var instanceA = faucets[0];
        var instanceB = faucets[1];
        var instanceC = faucets[2];
        var instanceD = faucets[3];


        instanceA.balanceOf(account)
        .then(function(result) {
            console.log("Faucet A token balance updated: ", result.toNumber());
            this.setState({
                tokenBalanceA: result.toNumber()
            })
        }.bind(this))

        instanceA.totalSupply()
        .then(function(supply) {
            var promises = [];
            for (var i = 0; i<supply.toNumber(); i++){
                promises.push(instanceA.ownerOf(i));
            }
            Promise.all(promises)
            .then(function(resolvedPromises){
                this.fetchTokenA(resolvedPromises, account);
            }.bind(this))
        }.bind(this))


        instanceB.balanceOf(account)
        .then(function(result) {
            console.log("Faucet B token balance updated: ", result.toNumber());
            this.setState({
                tokenBalanceB: result.toNumber()
            })
        }.bind(this))

        instanceB.totalSupply()
        .then(function(supply) {
            var promises = [];
            for (var i = 0; i<supply.toNumber(); i++){
                promises.push(instanceB.ownerOf(i));
            }
            Promise.all(promises)
            .then(function(resolvedPromises){
                this.fetchTokenB(resolvedPromises, account);
            }.bind(this))
        }.bind(this))

        instanceC.balanceOf(account)
        .then(function(result) {
            console.log("Faucet C token balance updated: ", this.props.web3.fromWei(result.toNumber()));
            this.setState({
                tokenBalanceC: this.props.web3.fromWei(result.toNumber())
            })
        }.bind(this))

        instanceD.balanceOf(account)
        .then(function(result) {
            console.log("Faucet D token balance updated: ", this.props.web3.fromWei(result.toNumber()));
            this.setState({
                tokenBalanceD: this.props.web3.fromWei(result.toNumber())
            })
        }.bind(this))
    }

    handleMintA() {
        this.handleMintERC721(true);
    }

    handleMintB() {
        this.handleMintERC721(false);
    }

    handleMintC() {
        this.handleMintERC20(true);
    }

    handleMintD() {
        this.handleMintERC20(false);
    }


    handleMintERC721(isFaucetA) {
        this.setState({
            justMintedA: false,
            justMintedB: false,
            justMintedC: false,
            justMintedD: false,
        })

        var instance = isFaucetA ? this.state.faucetInstanceA : this.state.faucetInstanceB;
        var account = this.state.account;
        instance.mint({from:this.state.account})
        // Get minted token number for UI
        .then(function(result) {
            console.log("Minting successful", result);
            var txLogs = getLogs(result);
            var mintedToken = txLogs[0].args._tokenId.toNumber();
            var priorOwnedToken = isFaucetA ? this.state.tokenOwnedA : this.state.tokenOwnedB;
            priorOwnedToken.push(mintedToken)

            if (isFaucetA) {
                this.setState({
                    justMintedA: true,
                    latestMintedTokenA: txLogs[0].args._tokenId.toNumber(),
                    tokenOwnedA: priorOwnedToken
                })
            } else {
                this.setState({
                    justMintedB: true,
                    latestMintedTokenB: txLogs[0].args._tokenId.toNumber(),
                    tokenOwnedB: priorOwnedToken
                })
            }

            // The gas in the following line is to prevent caching
            // see https://github.com/ethereum/web3.js/issues/1463
            return instance.balanceOf.call(account, {gas: 500000+Math.floor(Math.random()*1001)})
        }.bind(this))
        .then(function(result) {
            var balance = result.toNumber();
            console.log("Faucet token balance updated: ", balance);

            if (isFaucetA) {
                this.setState({
                    tokenBalanceA: result.toNumber(),
                })
            } else {
                this.setState({
                    tokenBalanceB:  result.toNumber(),
                })
            }
        }.bind(this))
    }

    handleMintERC20(isFaucetC) {
        this.setState({
            justMintedA: false,
            justMintedB: false,
            justMintedC: false,
            justMintedD: false,
        })

        var instance = isFaucetC ? this.state.faucetInstanceC : this.state.faucetInstanceD;
        var account = this.state.account;
        instance.mint({from:this.state.account})
        // Get minted token number for UI
        .then(function(result) {
            console.log("Minting successful", result);
            // The gas in the following line is to prevent caching
            // see https://github.com/ethereum/web3.js/issues/1463
            return instance.balanceOf.call(account, {gas: 500000+Math.floor(Math.random()*1001)})
        }.bind(this))
        .then(function(result) {
            var balance = this.props.web3.fromWei(result.toNumber());
            console.log("Faucet token balance updated: ", balance);

            if (isFaucetC) {
                this.setState({
                    tokenBalanceC: balance,
                })
            } else {
                this.setState({
                    tokenBalanceD: balance,
                })
            }
        }.bind(this))
    }


    mintMessage() {
        if (this.state.justMintedA) {
            return(<div className="centered">Minting successful. You received the ant token with
            id &nbsp; <strong>{this.state.latestMintedTokenA}</strong>.</div>)
        }

        if (this.state.justMintedB) {
            return(<div className="centered">Minting successful. You received the beaver token with
             id &nbsp; <strong>{this.state.latestMintedTokenB}</strong>.</div>)
        }

        if (this.state.justMintedC || this.state.justMintedD) {
            return(<div className="centered">Minting successful.</div>)
        }


        return (<p></p>);

    }


    render() {
        if(!this.props.web3Connected) {
            return (
                <div> Please establish web3 connection </div>
            )
        }

        return (
            <div>
            In order to make testing the contract easier, I created several token faucets, two for ERC721 token and two for ERC20 token.
            That way you can test every combination you like. Just press the buttons below and receive the respective token.
            To stay with the theme, the first ERC721 token contract is called CryptoAnts, the other CryptoBeavers.
            In the case of ERC721 token you will receive one token per mint (its id will be displayed). For ERC20 token you will get a hundred at a time.<br/><br/>
                <h5> ERC721 Token CryptoAnts and CryptoBeavers </h5>

                {
                    this.state.tokenBalanceA === 0
                    ? <p> The Ant ERC721 token contract is deployed at <strong>{this.state.faucetAddressA}</strong> where you currently
                    own no token.</p>
                    : <p> The Ant ERC721 token contract is deployed at <strong>{this.state.faucetAddressA}</strong> where you currently
                    own the token <strong> {this.state.tokenOwnedA.toString()} </strong> (in total <strong>{this.state.tokenBalanceA}</strong> ant
                    token).</p>
                }
                {
                    this.state.tokenBalanceB === 0
                    ? <p> The Beaver ERC721 token contract is deployed at <strong>{this.state.faucetAddressB}</strong> where you currently
                    own no token.</p>
                    : <p> The Beaver ERC721 token contract is deployed at <strong>{this.state.faucetAddressB}</strong> where you currently
                    own the token <strong> {this.state.tokenOwnedB.toString()} </strong> (in total <strong>{this.state.tokenBalanceB}</strong> beaver
                    token).</p>
                }

                <h5> ERC20 Token </h5>
                Similarly, there are two ERC20 token faucets deployed. One is at <strong>{this.state.faucetAddressC}</strong> where you currently
                own <strong>{this.state.tokenBalanceC}</strong> token, the other at <strong>{this.state.faucetAddressD}</strong> where you currently
                own <strong>{this.state.tokenBalanceD}</strong> token.
                <br></br><br></br><br></br>

                <div className="centered">
                <br></br>
                <br></br><br></br>
                    <FormGroup row>
                      <Col>
                      <Button color="primary"  onClick={this.handleMintA.bind(this)} >Mint an ant</Button>{'     '}
                      </Col>

                      <Col >
                      </Col>

                      <Col>
                      <Button color="primary" onClick={this.handleMintB.bind(this)} >Mint a beaver</Button>
                      </Col>


                    <Col >
                    </Col>

                    <Col>
                    <Button color="primary" onClick={this.handleMintC.bind(this)} >Mint ERC20 A</Button>
                    </Col>


                      <Col >
                      </Col>

                      <Col>
                      <Button color="primary" onClick={this.handleMintD.bind(this)} >Mint ERC20 B</Button>
                      </Col>

                    </FormGroup>

                </div>
                {this.mintMessage()}
            </div>
        );
    }
}

export default Testing
// <Button color="primary" size="lg" onClick={this.handleMintA.bind(this)} >Mint an ant</Button>{'     '}
// <Button color="primary" size="lg" onClick={this.handleMintB.bind(this)} >Mint a beaver</Button>
