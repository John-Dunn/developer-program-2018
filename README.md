# Consensys Developer Program 2018 Final Project
I chose to implement my own idea, a dApp that allows trustless trade of arbitrary Ethereum assets (ERC20, ERC721 token, and Ether via WETH). ERC721 token are non-fungible token with the most popular example being CryptoKitties. The most important feature of ERC721 token is that (in contrast to Ether or ERC20 token) they are distinguishable from one-another and are great for e.g. implementing trading cards (you can find more information about ERC721 [here](http://erc721.org/)).

While there are marketplaces that allow selling (a small set of) ERC20 token or auction ERC721 token, the ability to trade arbitrary token without a third party is sorely missed.
The aim of this project is to implement this trustless trade mechanism, with the main use case, in my mind, being the direct trade of ERC721 token.

In this readme I will focus on providing the information you need for evaluating this project, but if you are interested in reading more about the project feel free to have a look at the `Project Outline.md`.


![Account setup](/img/create.gif)

## Description
A trustless marketplace where one-to-one trades of ERC20 and ERC721 token can take place without going through Ether first or requiring an arbitrator. Users can create trades, cancel them and fill other users' trades. Upon cancellation or completion of a trade, all users can withdraw their new token.


#### User stories
- As a owner of ERC721/ERC20 token, I want to trade it for some other ERC721/ERC20 token per smart contract so that I don't have to sell it first or trust a third party

- As a owner of ERC721/ERC20 token, I want to create a trade by specifying my token as well as the token I want to trade my token for so that the owner of that token is able to complete the trade and we both get each other's token.

- As a user I want to browse all trades

- As the participant of a trade I want to be recognized when opening the app so that I can  easily find my trades sand see their status

- As the maker of a trade I want to be able to cancel it so that I receive my token back

- As the owner of a wanted token I want to be able to complete a trade so that I receive the maker's token

- As the maker of a trade I want to withdraw the taker's token from completed trades


## Running the project
The following instructions have been tested on a fresh Ubuntu 16.04.05 LTS with git (2.7.4, `sudo apt-get install git`)
nodejs (8.11.4), npm (5.6.0) (see [here](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)), ganache-cli (6.1.8, `sudo npm install -g ganache-cli`), and truffle (4.1.14, `sudo npm install -g truffle`) installed.

In addition you need Metamask. I chose the (non-experimental) Firefox version. If you have any trouble getting this installed or the steps below to work please let me know.

1. Checkout the project: `git clone https://github.com/John-Dunn/developer-program-2018.git` and change into that folder `cd developer-program-2018`.
2. Run `npm install` to install the dependencies for the frontend (this took ~180s on my VM)
3. Run `ganache-cli` and remember the mnemonic for importing it in Metamask later (or run `ganache-cli -m "voice inch endorse recycle absurd claim ripple receive section same exist profit"` and use that mnemonic).
4. Import the seed phrase to Metamask and switch to localhost:8545. You should see a balance of 100 ETH.
5. Open a new terminal in the same folder and run `truffle compile` and `truffle migrate`
6. Launch the frontend with `npm run start`. Your browser window at http://localhost:3000/ should open.
You may need to refresh the page.

## Things you can try
In order to test the full functionality as maker and taker of a trade, you may want to create a second Metamask account. You can do so in the top right corner as shown in this image.

![Account setup](/img/metamaskAccount.png)


To make testing easier, there is a <b>Testing</b> section where you can mint token from different ERC20 and ERC721 faucets
For example mint an ant token for account 1, swith to account 2, refresh the page, and mint some ERC20A token. From account 2 you can now create a trade of your ERC20 token for the ant token of the other account. The steps to do that are described below.
Unfortunately the UI is not as smooth as I'd like it to be (when is it ever?). It may occasionally be helpful to refresh the page whenever you switch accounts or some update is stuck. If your Metamask popup is blank it may help to resize it.

#### Creating a trade
Go to the <b>New Trade</b> tab and fill out the form (if you followed the steps above you could create a trade giving away e.g. 10 ERC20A for ant token 0). Once you created the trade, you see it in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab.

#### Cancelling a trade
Find your trade, either in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab. If you are the maker you will see a cancel button below your trade. Once a trade is cancelled and you look it up again, you will have the option to withdraw your token.

#### Filling a trade
Once a trade is created, the owner of the wanted token can fill it. Create a trade as described above (if you just created and cancelled a trade, you can just create the same trade again), then switch to the other account and refresh the page. Find the trade in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab, where you will see a button to complete the trade. Once completed both maker and taker accounts can now lookup the trade under the inactive trades where and withdraw the traded token. You can check which token you own at any time by switching to the <b>Testing</b> tab.


That's it! Feel free to try any other token combination you'd like.
I hope you had a bit of fun playing around with it.
All contracts are also deployed on Rinkeby, so you can try them out there as well (unfortunately the UI does not support it yet).
See the `deployed_addresses.md` for more details.
If you read the project outline you will know I am planning on expanding the functionality and running the dApp on the mainnet.
I would very much appreciate any feedback! Please let me know on Ryver (JohnDunn) or open an issue.



## Grading Rubric
In order to facilitate grading, for each of the rubrics I'll point to the corresponding piece of code or explain where to find the information required.

#### User Interface Requirements
If you have gotten the app to run as mentioned in the previous section, the first two requirements should not be a problem. For the third point, the current account can always be seen on in the top right. One example for signing transactions and reflecting the contract updates in the UI is the <b>Testing</b> tab where you sign a transaction to mint token and the total balance is updated in the UI.

#### Testing
If you run `truffle test` you will see Javascript tests running for 4 contracts (on my VM I closed Firefox and the UI console, but left ganache running).
There are the main contracts (`Etherary.sol`, `TokenInterface.sol`), as well as two token faucets for ERC20 (`GenericERC20TokenA.sol` and `GenericERC20TokenA.sol`) and ERC721 Token (`GenericERC721TokenA.sol`, `GenericERC721TokenB.sol`). The two token faucets per token type only differ in their name, so only one of each is tested.
Since `ERC20.sol` and `ERC721.sol` are only interfaces that do not contain any functionality they are not tested.  

As an example of test structure, you can have a look at e.g. `test/ERC20 for ERC721 Trade/etherary.tradeFilling.test.js` where the context is set up my minting token to two accounts and creating a trade before each test. Each test is for a different stage of the trade completion process. For example the third test in that file completes a transaction and checks whether the `TradeCompleted` event is being emitted.

Each of the functions of the main contracts is tested thoroughly (>5 tests for creating, cancelling and completing an order, for each combination of token). The token faucets consist of very little code (they use the openzeppelin token contracts which are well-tested), yet are also tested for main functionality.

#### Design Pattern Requirements
- Circuit Breaker : The main contract `Etherary.sol` is `Ownable` and allows the owner to toggle the `stopped` variable. The modifier `stopInEmergency` based on that prevents new trades from being created or existing trades from being completed when a contract is stopped. Contract owners still may cancel and withdraw their token, as well as withdraw their token from completed trades.
- Other design decisions are explained in `design_pattern_decisions.md`


#### Common Attacks
Please see `avoiding_common_attacks.md`

#### Library
Each contract uses some OpenZeppelin contract. The main contract uses `Ownable` for circuit breaker functionality, the token faucets rely heavily on the token definitions and SafeMath. The contracts and libraries are imported via npm as ethPM does not carry the latest version (1.03 vs. 1.13).

#### Additional Requirements
If you check any contract (e.g. `Etherary.sol`) you will see it is thoroughly commented according to spec.

#### Stretch goal
Althouth the UI is not yet ready for it, the contracts have been deployed on the Rinkeby testnet. Please see `deployed_addresses.md` for more info.
