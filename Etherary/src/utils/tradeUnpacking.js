export function tradeToMaker (trade) {
    return trade[0];
}

export function tradeToContract (trade) {
    return trade[1];
}

export function tradeToMakerTokenId (trade) {
    return trade[2].toNumber();
}

export function tradeToTakerTokenId (trade) {
    return trade[3].toNumber();
}

export function tradeToActive (trade) {
    return trade[4];
}

export function tradeToTaker (trade) {
    return trade[5];
}
