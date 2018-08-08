## Etherary: Trustless swapping of arbitrary Ethereum-based assets
Trade your CryptoKitty for anything you want: maybe two other CryptoKitties, maybe your favourite CryptoCelebrity, maybe 1 ETH. Every combination of ETH, ERC20, and ERC721 token is possible, just like when you used to barter your favourite trading cards. There is no need to exchange everything to ETH first and no third party involved. You put your asset up for trade and specify what you want in exchange. If somebody accepts, the assets are swapped immediately.

### Why is there a need for Etherary
Traditional exchanges offer trading pairs, mostly with BTC and ETH, and often do not allow trading ERC721 token at all (although 0x has [made an announcement to that regard](https://blog.0xproject.com/sneak-peek-0x-trade-widget-cbd13305407d)). The closest exchange to feature this is ShapeShift which offers direct trading pairs between many (but far from all) popular token. There are some ERC721 exchanges such as OpenSea, Emoon, or  Rare bits. They, too, however too only allow exchanging ERC721 token for ETH.

A trustless exchange of assets is at the core of Ethereum.
It should be possible to exchange arbitrary on-chain assets without trusting a third party or even without waiting for some exchange to list the particular asset pair.

Most importantly I believe it may not always be in the spirit of non-fungible tokens to put a price tag on them (which would be the case if selling to ETH and then buying something else). Just like trading cards, people have different preferences, prefer furry cats over yellow ones, and so on. There is a lot of room for creativity and imagination when interacting with your favourite CryptoKitty or Celebrity which gets cheapened by putting a price on it.


### Who would use Etherary
- People who want to trade ERC721 for other ERC721, keeping the trading card spirit alive
- Trade unlisted ERC20 token for ETH or other token (note that you need to do order matching yourself as of now)

### Roadmap
#### Completed:
MVP: One-to-one exchange of ERC721 token of the same contract (e.g. token with ID 5 for token with ID 123), allowing the following functionality:
1. The seller approves the Etherary contract for a particular tokens
2. The seller creates a trade order, specifying the token contract and two token IDs: the token to give away and the desired token to receive
3. The Etherary contract claims ownership of that token and creates the Trade
4. The owner of that token can fill that order, again having allowed the contract to withdraw that token
6. The contract withdraws the desired token
7. Once in possession of both token, the trade is completed and the maker and taker each are approved for their respective token
8. Both parties withdraw their token.

#### Upcoming:
###### Second Phase: Frontend
Using React, provide a visualisation of open trades and allow the use of all functionality mentioned above via the browser and Metamask.
TODOs:
- Fix issue with status persistence in trade Card
- add cancel and fill functionality to card as modal, check for data integrity
- display all trades
- MVP status (i.e. fulfills all requirements to be submitted). Each following phase maintains this.
- Usability: Make sure every form allows submit on enter

###### Third Phase: Trade for different contract
Allow specifying a different ERC721 contract and token to receive

###### Fourth Phase: 1 for m trades
Extend the contract to allow specifying multiple tokens to be received.

###### Fifth Phase: n for m trades
allow to offer multiple token as well as receive multiple token

###### Fourth Phase: ERC20
Now allow ERC20 token to be added to both sides of the trade, instead of provinding a token ID an amount is required. This also covers ETH via WETH.

###### Fifth Phase: Quality of Life
- Compliance with ERC165, implement ERC721Receiver
- Expiration dates on trades
- Open-ended orders (make me an offer! this may be better suited to be done off-chain)
- Maybe UX improvements are possible? Currently 6 transactions are required to complete a trade, 3 by each participant (maker approves, maker creates order, taker approves, taker fills order, maker and taker withdraw). Maybe this can be reduced.





<!-- ### 3. Background, Business Divers and Significance
### 4. Benefits and Costs
### 5. Implementation Method
### 7. Requirements
### 8. Expected Outcomes -->
