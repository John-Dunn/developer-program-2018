// struct Trade {
//     //AssetType assetType;
//     address maker;
//     address taker;
//     address makerTokenContract;
//     address takerTokenContract;
//     uint256 makerTokenId; /// @dev only used for ERC721
//     uint256 takerTokenId; /// @dev only used for ERC721
//     bool isActive;
// }

export function tradeToMaker (trade) {
    return trade[0];
}

export function tradeToTaker (trade) {
    return trade[1];
}

export function tradeToMakerContract (trade) {
    return trade[2];
}

export function tradeToTakerContract (trade) {
    return trade[3];
}

export function tradeToMakerTokenId (trade) {
    return trade[4].toNumber();
}

export function tradeToTakerTokenId (trade) {
    return trade[5].toNumber();
}

export function tradeToActive (trade) {
    return trade[6];
}
