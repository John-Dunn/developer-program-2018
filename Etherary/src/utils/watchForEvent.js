import Web3 from 'web3'

let watchForEvent = function(event) {
    return new Promise(function(resolve, reject) {
        event.watch(function(error, log){
            if (!error) {
                event.stopWatching();
                resolve(log);
            } else {
                console.log('Error listening to event: ', event);
            }
        })

    })
}

export default watchForEvent
