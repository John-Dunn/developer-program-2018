### Etherary: Trustless swapping of arbitrary Ethereum-based assets
Trade your CryptoKitty for anything you want: maybe two other CryptoKitties, maybe your favourite CryptoCelebrity, maybe 1 ETH. Every combination of ETH, ERC20, and ERC721 token is possible, just like when you used to barter your favourite trading cards. There is no need to exchange everything to ETH first and no third party involved. You put your asset up for trade and specify what you want in exchange. If somebody accepts, the assets are swapped immediately.

### Why is there a need for Etherary
Traditional exchanges offer trading pairs, mostly with BTC and ETH.
- take long to list token -> majority unlisted
- currently don't offer ERC721
E.g.: IDEX (only fungible), 0x (only ERC20, maybe soon https://blog.0xproject.com/sneak-peek-0x-trade-widget-cbd13305407d)
The closest exchange to feature this is ShapeShift which offers direct trading pairs between many (but far from all) popular token.

There are some ERC721 exchanges such as OpenSea, Emoon, Rare bits (only erc721 <-> ETH), known origin (erc721 for eth)
however, they too only allow exchanges to eth.

### Who would use Etherary
- People who want to trade ERC721 for other ERC721
- trade unlisted ERC20 token for eth or for other (note that you need to do order matching yourself)

### Roadmap
Prelims:
    Start a ganache chain with the faucets deployed:
    Address 1: 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
    Address 2: 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
    GET20: 0xde09e74d4888bc4e65f589e8c13bce9f71ddf4c7
    GET721: 0xa45eef86cc2eb1477872b07a1298ffa29313610d

First Phase:
    1) Allow seller to open an order, providing the following:
    - the ERC721 token (will be locked in the contract)
    - the same erc721 token, but other id as accepted trade
    - smart contract has mapping address => uint[] orderId
    2) The buyer can fill that order, sending
    - order id
    - the token
    3) The assets are exchanged

Second Phase:
    Frontend

Unordered feature list that would be nice to have:
    Compliance with ERC165
    Order cancelling
    Expiration time can be set, after which no offers will be accepted anymore
    Open ended orders? I.e. I have this for sale, make me an offer. Should this be on-chain?





### 3. Background, Business Divers and Significance
### 4. Benefits and Costs
### 5. Implementation Method
### 7. Requirements
### 8. Expected Outcomes
