var exceptions = require("./exceptions.js");

var GenericERC721Token = artifacts.require('GenericERC721Token')
var Etherary = artifacts.require("Etherary");


contract('Etherary', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasEstimateDeployment = web3.eth.estimateGas({data: GenericERC721Token.bytecode});
    const gasForMinting = 300000;

    var token;
    var etherary;

    const tokenAliceSells = 0;
    const tokenAliceWantsBobOwns = 1;
    const tradeId = 0;

    before(async function() {
        // Deploy the ERC721 Faucet
        token = await GenericERC721Token.new();
        // Mint a couple of token for Alice and Bob
        await token.mint({from: alice, gas:gasForMinting});
        await token.mint({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new();

        // Approve main contract to withdraw token to be sold
        await token.approve(etherary.address, tokenAliceSells, {from: alice});

        // Create a trade
        await etherary.createERC721Trade(
            token.address,
            tokenAliceSells,
            tokenAliceWantsBobOwns,
            {from: alice}
        );
    });

    describe("Cancelling a trade", function () {
        it("should not be possible for Bob to cancel Alice's trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721Trade.sendTransaction(tradeId, {from: bob}),
                exceptions.errTypes.revert
            );
        });


        it("should not be possible to cancel a nonexisting trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721Trade.sendTransaction(10, {from: alice}),
                exceptions.errTypes.revert
            );
        });


        it("should be possible to cancel your own trade", async function () {
            await etherary.cancelERC721Trade.sendTransaction(tradeId, {from:alice});
            let approvedForToken = await token.getApproved.call(tokenAliceSells);
            assert.equal(approvedForToken, alice, "Alice should be approved to withdraw her token");

            // Check for TradeCancelled event
            const LogTradeCancelled = await etherary.TradeCancelled();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCancelled.watch(function(error, log){ resolve(log); } );
            });
            const logtradeId = log.args._tradeId.toNumber()
            assert.equal(logtradeId, tradeId, "Should emit TradeCancelled event with correct tradeId");
        });


        it("should be possible to query a cancelled trade's status", async function () {
            let Trade = await etherary.idToTrade.call(tradeId);
            assert.equal(Trade[5], false, "Cancelled trade should be inactive");
        })


        it("should not be possible to cancel an trade twice", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721Trade.sendTransaction(
                    tradeId,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

        it("should be possible for Alice to withdraw her token after cancelling", async function () {
            let tokenOwnerBefore = await token.ownerOf.call(tokenAliceSells);
            let approvedAddressBefore = await token.getApproved.call(tokenAliceSells);
            await token.safeTransferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAliceSells,
                {from:alice, gas: gasForMinting}
            );
            let tokenOwnerAfter = await token.ownerOf.call(tokenAliceSells);
            let approvedAddressAfter = await token.getApproved.call(tokenAliceSells);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should be owned by contract initially");
            assert.equal(approvedAddressBefore, alice, "Alice should be approved to withdraw after cancelling");
            assert.equal(tokenOwnerAfter, alice, "Token should be owned by alice after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        });



    });


    describe("Cancelling a filled trade", function () {
        // Deploy a new token contract
        before(async function() {
            token = await GenericERC721Token.new();
        });

        before(async function() {
            // Mint token for Alice and Bob
            await token.mint.sendTransaction({from: alice, gas:gasForMinting});
            await token.mint.sendTransaction({from: bob, gas:gasForMinting});

            // Deploy new main contract
            etherary = await Etherary.new();
        });

        before(async function() {
            // Approve main contract to withdraw token to be sold and bought
            await token.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});
            await token.approve.sendTransaction(etherary.address, tokenAliceWantsBobOwns, {from: bob});

            // Create a trade
            await etherary.createERC721Trade.sendTransaction(
                token.address,
                tokenAliceSells,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Fill that trade
            await etherary.fillERC721Trade.sendTransaction(tradeId, {from: bob});
        });

        it("should not be possible to cancel a filled trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721Trade.sendTransaction(tradeId, {from:alice}),
                exceptions.errTypes.revert
            );
        });

    });
});
