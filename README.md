# Consensys Developer Program 2018 Final Project
I chose to implement my own idea, a dApp to trade arbitrary ERC721 token directly. ERC721 token are non-fungible token with the most popular example being CryptoKitties (you can find more information about ERC721 [here](http://erc721.org/)). The most important feature of ERC721 token is that (in contrast to Ether or ERC20 token) they are distinguishable from one-another, like for example a painting.

While there are marketplaces that allow auctioning ERC721 token for Ether, I believe trading them directly is more fun and in closer to the spirit of 'trading cards'. This is the topic of my project.

In this readme I will focus on providing the information you need for evaluating this project, but if you are interested in reading more about the project feel free to have a look at the `Project Outline.md`.

## Description
A trustless marketplace where one-to-one trades of ERC721 can take place without going through Ether first or requiring an arbitrator. Users can create trades, cancel them and fill other users' trades. Upon cancellation or completion of a trade, all users can withdraw their new token.


#### User stories
- As a owner of an ERC721 token, I want to trade it for some another token per smart contract so that I don't have to selling it first or trust a third party

- As a owner of an ERC721 token, I want to create a trade by specifying my token as well as the token I want to trade my token for so that the owner of that token is able to complete the trade and we both get each other's token.

- As a user I want to browse all trades

- As the participant of a trade I want to be recognized when opening the app so that I can  easily find my trades sand see their status

- As the maker of a trade I want to be able to cancel it so that I receive my token back

- As the owner of a wanted token I want to be able to complete a trade so that I receive the maker's token

- As the maker of a trade I want to withdraw the taker's token from completed trades


## Running the project
The following instructions have been tested on a fresh Ubuntu 16.04 LTS. If you have any trouble getting it to work please let me know.

1. Running ganache: Run `ganache-cli` and remember the mnemonic for importing it in Metamask later (or run `ganache-cli -m "voice inch endorse recycle absurd claim ripple receive section same exist profit"` and use that mnemonic).
2. Compile 



Contains the following exercises and projects created in the context of the developer program:
* Final Project (work in progress): Etherary - trustless exchange of arbitrary ERC721 Token
* Supplementary for the final project: An implementation of a faucet for ERC20 token deployed on Rinkeby (for more details see the README in the respective directory) as well as an ERC721 faucet (not yet deployed)
* Exercises: Simple bank and supply chain exercise
