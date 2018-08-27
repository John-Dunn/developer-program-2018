// struct Trade {
//     bool isMakerContractERC20; // If false, ERC721
//     bool isTakerContractERC20; // If false, ERC721
//     address maker;
//     address taker;
//     address makerTokenContract;
//     address takerTokenContract;
//     uint256 makerTokenIdOrAmount;
//     uint256 takerTokenIdOrAmount;
//     bool isActive;
// }

export function tradeToIsMakerContractERC20 (trade) {
    return trade[0];
}

export function tradeToIsTakerContractERC20 (trade) {
    return trade[1];
}

export function tradeToMaker (trade) {
    return trade[2];
}

export function tradeToTaker (trade) {
    return trade[3];
}

export function tradeToMakerContract (trade) {
    return trade[4];
}

export function tradeToTakerContract (trade) {
    return trade[5];
}

export function tradeToMakerTokenId (trade) {
    return trade[6].toNumber();
}

export function tradeToTakerTokenId (trade) {
    return trade[7].toNumber();
}

export function tradeToActive (trade) {
    return trade[8];
}
