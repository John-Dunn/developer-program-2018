let getLogs = function (tx) {
    var txHash = tx.tx;
    var matchingLogs = [];
    for (var logIndex = 0; logIndex < tx.logs.length; logIndex++) {
        var log = tx.logs[logIndex]
        if (log.transactionHash === txHash) {
            matchingLogs.push(log);
        }
    }
    return matchingLogs;
}

export default getLogs
