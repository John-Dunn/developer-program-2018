# Consensys Developer Program 2018 Final Project
I chose to implement my own idea, a dApp to trade arbitrary ERC721 token directly. ERC721 token are non-fungible token with the most popular example being CryptoKitties (you can find more information about ERC721 [here](http://erc721.org/)). The most important feature of ERC721 token is that (in contrast to Ether or ERC20 token) they are distinguishable from one-another, like for example a painting.

While there are marketplaces that allow auctioning ERC721 token for Ether, I believe trading them directly is more fun and in closer to the spirit of 'trading cards'. This is the topic of my project.

In this readme I will focus on providing the information you need for evaluating this project, but if you are interested in reading more about the project feel free to have a look at the `Project Outline.md`.

## Description
A trustless marketplace where one-to-one trades of ERC721 can take place without going through Ether first or requiring an arbitrator. Users can create trades, cancel them and fill other users' trades. Upon cancellation or completion of a trade, all users can withdraw their new token.


#### User stories
- As a owner of an ERC721 token, I want to trade it for some another token per smart contract so that I don't have to sell it first or trust a third party

- As a owner of an ERC721 token, I want to create a trade by specifying my token as well as the token I want to trade my token for so that the owner of that token is able to complete the trade and we both get each other's token.

- As a user I want to browse all trades

- As the participant of a trade I want to be recognized when opening the app so that I can  easily find my trades sand see their status

- As the maker of a trade I want to be able to cancel it so that I receive my token back

- As the owner of a wanted token I want to be able to complete a trade so that I receive the maker's token

- As the maker of a trade I want to withdraw the taker's token from completed trades


## Running the project
The following instructions have been tested on a fresh Ubuntu 16.04.05 LTS with git, nodejs (8.11.4), npm (5.6.0), ganache-cli (6.1.8), and truffle (4.1.14) installed. If you have any trouble getting the steps below to work please let me know.

1. Run `npm install` to install the dependencies (may take a bit)
2. Run `ganache-cli` and remember the mnemonic for importing it in Metamask later (or run `ganache-cli -m "voice inch endorse recycle absurd claim ripple receive section same exist profit"` and use that mnemonic).
3. Import the seed phrase to Metamask and switch to localhost:8545. You should see a balance just below 100 ETH. 
4. `truffle compile` and `truffle migrate`
5. Launch the frontend with `npm run start`. Your browser window at http://localhost:3000/ should open.
and connect to localhost 8545. You may need to refresh the page.

## Things you can try
In order to test the full functionality as maker and taker of a trade, you may want to create a second Metamask account. You can do so in the top right corner as shown in this image. Whenever you switch accounts, you need to refresh the page.

![Account setup](/img/metamaskAccount.png)


To make testing easier, there is a <b>Testing</b> section where you can mint different ERC721 token.
For example mint two ant token for account 1, then switch to account 2, refresh the page and mint two beaver token for account 2.

#### Creating a trade
Go to the <b>New Trade</b> tab and fill out the form (if you followed the steps above you could create a trade giving away beaver token 0 for ant token 0). Once you created the trade, you see it in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab.

#### Cancelling a trade
Find your trade, either in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab. If you are the maker you will see a cancel button below your trade. Once a trade is cancelled and you look it up again (tick the `Show inactive` checkbox), you will have the option to withdraw your token.

#### Filling a trade
Once a trade is created, the owner of the wanted token can fill it. Create a trade as described above (if you just created and cancelled a trade, you can just create the same trade again), then switch to the other account and refresh the page. Find the trade in the <b>Browse Trades</b> tab or the <b>Lookup Trade</b> tab, where you will see a button to complete the trade. Once completed both maker and taker accounts can now lookup the trade under the inactive trades where and withdraw the traded token. You can check which token you own at any time by switching to the <b>Testing</b> tab.


That's it! I hope you had a bit of fun playing around with it. If you read the project outline you will know I am planning on expanding the functionality and running the dApp on the mainnet. I would very much appreciate any feedback! Please let me know on Ryver (JohnDunn) or open an issue.



## Grading Rubric
In order to facilitate grading, for each of the rubrics I'll point to the corresponding piece of code or explain where to find the information required.

#### User Interface Requirements
If you have gotten the app to run as mentioned in the previous section, the first two requirements should not be a problem. For the third point, the current account can always be seen on the right side of the header. One example for signing transactions and reflecting the contract updates in the UI is the <b>Testing</b> tab where you sign a transaction to mint a token and the token ID as well as the total balance is updated in the UI.

#### Testing
If you run `truffle test` you will see Javascript tests running for the 3 contracts.
There is the main contract (`Etherary.sol`), as well as token faucets for ERC20 (`GenericERC20Token.sol`) and ERC721 Token (`GenericERC721TokenA.sol`, `GenericERC721TokenB.sol` which only differn by name).

As an example of test structure, you can have a look at e.g. `etherary.orderFilling.test.js` where the context is set up my minting token to two accounts and creating a trade before each test. Each test is for a different stage of the trade completion process. For example the third test in that file completes a transaction and checks whether the `TradeCompleted` event is being emitted.

Each of the three main actions of the main contract is tested thoroughly (>5 tests for creating, cancelling and completing an order). The token faucets consist of very little code (they use the openzeppelin token contracts which are well-tested), yet are also tested for main functionality. Since the two ERC721 faucets are the same except the name, only one is tested.

#### Design Pattern Requirements
[TODO: mention for the following two that faucets are irrelevant]
- Circuit Breaker : The main contract `Etherary.sol` is `Ownable` and allows the owner to toggle the `stopped` variable. The modifier `stopInEmergency` based on that prevents new trades from being created or existing trades from being completed when a contract is stopped. Contract owners still may cancel and withdraw their token, as well as withdraw their token from completed trades.
- Other design decisions are explained in `design_pattern_decisions.md`


#### Common Attacks
Please see `avoiding_common_attacks.md`

#### Library
Each contract uses some OpenZeppelin contract. The main contract uses `Ownable` for circuit breaker functionality, the token faucets rely heavily on the token definitions and SafeMath. The contracts and libraries are imported via npm as ethPM does not carry the latest version (1.03 vs. 1.13).
