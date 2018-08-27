## Etherary: Trustless swapping of arbitrary Ethereum-based assets
Trade your CryptoKitty for anything you want: maybe your favourite CryptoCelebrity, maybe 20 OMG, maybe 1 ETH. Every combination of ETH, ERC20, and ERC721 token is possible. There is no need to exchange everything to ETH first and no third party involved. You put your asset up for trade and specify what you want in exchange. If somebody accepts, the assets are swapped immediately.

### Why is there a need for Etherary
Traditional exchanges offer trading pairs, mostly with BTC and ETH, and often do not allow trading ERC721 token at all (although 0x has [made an announcement to that regard](https://blog.0xproject.com/sneak-peek-0x-trade-widget-cbd13305407d)). The closest exchange to feature this is ShapeShift which offers direct trading pairs between many (but far from all) popular token. There are some ERC721 exchanges such as OpenSea, Emoon, or Rare bits. They, too, however too only allow exchanging ERC721 token for ETH.

A trustless exchange of assets is at the core of Ethereum.
It should be possible to exchange arbitrary on-chain assets without trusting a third party or even without waiting for some exchange to list the particular asset pair.

Most importantly I believe it may not always be in the spirit of non-fungible tokens to put a price tag on them (which would be the case if selling to ETH and then buying something else). Just like trading cards, people have different preferences, prefer furry cats over yellow ones, and so on. There is a lot of room for creativity and imagination when interacting with your favourite CryptoKitty or Celebrity which gets cheapened by putting a price on it.


### Uses for Etherary
- Trade ERC721 for other ERC721, keeping the trading card spirit alive
- Trade unlisted ERC20 token for ETH or other token (note that you need to do order matching yourself as of now)
- Sell any ERC20 or ERC721 token for ETH (via [WETH](https://weth.io/))

### How it works
1. The seller approves the Etherary contract for some ERC20 token amount or for a ERC721 token.
2. The seller creates a trade, specifying the token contract and amount/ID of the token wanted.
3. The Etherary contract claims ownership of that token and creates the trade
4. The owner of the wanted token can complete that trade, again having allowed the contract to withdraw that token first
6. The contract withdraws the desired token
7. Once in possession of both token, the trade is completed and the maker and taker each are approved for their respective token
8. Both parties withdraw their token.


### Roadmap
#### Completed:
- Smart contract allowing exchange of any ERC20 or ERC721 token for some other ERC20 or ERC721 token as described above
- Basic Frontend allowing the contract functionality to be accessed via a GUI, as well as a trade browser and testing tools

#### Up next:
The project is in an MVP status but not yet ready to run live for various reasons. The next steps to get there are outlined below.

###### UI rework
The UI was built to enable easy evaluation of the smart contract, but featuring all that is required to run it in production was out of scope for this project. In particular the following points need to be addressed:
- Browsing all trades is an integral component. Currently trades are fetched one-by-one per RPC call. This is not feasible for a longer history and more than a handful of trades. A proper setup would require a persistent database that watches for contract events and keeps the state of trades, using e.g. a MongoDB
- Better state management: The inclusion of ERC20 contracts demonstrated that keeping state manually is increasingly complicated. Components are a lot larger and less modular than I would like them to be, mostly to reduce the state changes that need to be carried across components. Using e.g. Redux would enable a clean rework.
- UX improvements: In particular completing trades and withdrawing token should be easier. Currently 6 transactions are required to complete a trade, 3 by each participant (maker approves, maker creates order, taker approves, taker fills order, maker and taker withdraw. Even if this cannot be further reduced, the UI should make this as seamless as possible, e.g. redirect from the trade completion to the withdraw page
- Robustness: Frontend should be robust against 1) contracts not being deployed 2) Metamask being locked 3) Metamask being on a wrong network
- Improved gas estimation: Metamask occasionally fails to correctly calculate the gas cost and transactions fail. To prevent this for now, the gas costs have been set manually. In addition Metamask caches some calls and requires a workaround of providing some random gas value. Both of those issues should be fixed before working with real assets.

###### Improved testing
Currently there is some very similar code for checking e.g. ERC721-ERC20 and ERC721-ERC721 trades. Similar to the token interface in solidity, a javascript interface would allow just changing the contracts and some flags for each test. 

###### Contract Upgrades
- n for m trades: This is at the core of the intended use of ERC721 bartering, allow offering multiple token in a trade as well as wanting multiple token.
- Optional expiration dates on trades

###### Future Goals
- Frontend orderbook matching: Another important feature are open-ended trades (make me an offer on this token!), however this should probably not happen on-chain at the moment.
- Stay up-to-date: there are several other interesting token proposals, maybe some of them can be leveraged to make trades easier or traded here themselves
