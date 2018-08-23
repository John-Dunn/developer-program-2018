var exceptions = require("../exceptions.js");

var GenericERC721TokenA = artifacts.require('GenericERC721TokenA')
var GenericERC20TokenB = artifacts.require('GenericERC20TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Cancelling Trades (ERC721 for ERC20)', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA;
    var tokenB;
    var etherary;

    // ERC721 trades
    const isMakerERC20 = false;
    const isTakerERC20 = true;


    // token balances
    var amountMinted;
    var tokenAAliceSells = 0;
    var tokenBBobSells = 20;

    var tradeId = 0;

    before(async function() {
        tokenA = await GenericERC721TokenA.new({gas: 5000000});
        tokenB = await GenericERC20TokenB.new({gas: 5000000});

        var amountMintedBig = await tokenB.AMOUNT_TO_MINT.call();
        amountMinted = amountMintedBig.toNumber();

        // Mint a couple of token for Alice and Bob
        await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
        await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new({gas: 5000000});

        // Approve main contract to withdraw token to be sold
        await tokenA.approve.sendTransaction(etherary.address, tokenAAliceSells, {from: alice});
        await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});

        // Create a trade
        await etherary.createTrade(
            tokenA.address,
            isMakerERC20,
            tokenAAliceSells,
            tokenB.address,
            isTakerERC20,
            tokenBBobSells,
            {from: alice}
        );
    });


    describe("Cancelling a trade", function () {
        it("should not be possible for Bob to cancel Alice's trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelTrade.sendTransaction(tradeId, {from: bob}),
                exceptions.errTypes.revert
            );
        });


        it("should not be possible to cancel a nonexisting trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelTrade.sendTransaction(10, {from: alice}),
                exceptions.errTypes.revert
            );
        });


        it("should be possible to cancel your own trade", async function () {
            await etherary.cancelTrade.sendTransaction(tradeId, {from:alice});
            let approved = await tokenA.getApproved.call(tokenAAliceSells);
            assert.equal(approved, alice, "Alice should be approved to withdraw her token");

            // Check for TradeCancelled event
            const LogTradeCancelled = await etherary.TradeCancelled();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCancelled.watch(function(error, log){ resolve(log); } );
            });
            const logtradeId = log.args._tradeId.toNumber()
            assert.equal(logtradeId, tradeId, "Should emit TradeCancelled event with correct tradeId");
        });


        it("should be possible to query a cancelled trade's status, it should be inactive", async function () {
            let Trade = await etherary.idToTrade.call(tradeId);
            assert.equal(Trade[8], false, "Cancelled trade should be inactive");
        })


        it("should not be possible to cancel an trade twice", async function () {
            await exceptions.tryCatch(
                etherary.cancelTrade.sendTransaction(
                    tradeId,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

        it("should be possible for Alice to withdraw her token after cancelling", async function () {
            let ownerBefore = await tokenA.ownerOf.call(tokenAAliceSells);
            await tokenA.transferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAAliceSells,
                {from:alice, gas: gasForMinting}
            );
            let ownerAfter = await tokenA.ownerOf.call(tokenAAliceSells);

            assert.equal(ownerBefore, etherary.address, "Before withdrawing token is owned by contract");
            assert.equal(ownerAfter, alice, "After withdrawing token is owned by alice");
        });
    });


    describe("Cancelling a filled trade", function () {
        // Deploy a new token contract
        before(async function() {
            tokenA = await GenericERC721TokenA.new({gas: 5000000});
            tokenB = await GenericERC20TokenB.new({gas: 5000000});

            var amountMintedBig = await tokenB.AMOUNT_TO_MINT.call();
            amountMinted = amountMintedBig.toNumber();

            // Mint a couple of token for Alice and Bob
            await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
            await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new({gas: 5000000});

            // Approve main contract to withdraw token to be sold
            await tokenA.approve.sendTransaction(etherary.address, tokenAAliceSells, {from: alice});
            await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});

            // Create a trade
            await etherary.createTrade(
                tokenA.address,
                isMakerERC20,
                tokenAAliceSells,
                tokenB.address,
                isTakerERC20,
                tokenBBobSells,
                {from: alice}
            );
            // Fill that trade
            await etherary.fillTrade.sendTransaction(tradeId, {from: bob});
        });

        it("should not be possible to cancel a filled trade", async function () {
            await exceptions.tryCatch(
                etherary.cancelTrade.sendTransaction(tradeId, {from:alice}),
                exceptions.errTypes.revert
            );
        });

    });

    describe("Circuit Breaker", function () {
        // Deploy a new token contract
        before(async function() {
            tokenA = await GenericERC721TokenA.new({gas: 5000000});
            tokenB = await GenericERC20TokenB.new({gas: 5000000});

            var amountMintedBig = await tokenB.AMOUNT_TO_MINT.call();
            amountMinted = amountMintedBig.toNumber();

            // Mint a couple of token for Alice and Bob
            await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
            await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new({gas: 5000000});

            // Approve main contract to withdraw token to be sold
            await tokenA.approve.sendTransaction(etherary.address, tokenAAliceSells, {from: alice});
            await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});

            // Create a trade
            await etherary.createTrade(
                tokenA.address,
                isMakerERC20,
                tokenAAliceSells,
                tokenB.address,
                isTakerERC20,
                tokenBBobSells,
                {from: alice}
            );
        });

        it("should be possible to cancel a trade and withdraw token while stopped", async function () {
            const ownerBefore = await tokenA.ownerOf.call(tokenAAliceSells);
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await etherary.cancelTrade.sendTransaction(tradeId, {from:alice});
            await tokenA.transferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAAliceSells,
                {from:alice, gas: gasForMinting}
            );
            const ownerAfter = await tokenA.ownerOf.call(tokenAAliceSells);
            assert.equal(ownerBefore, etherary.address, "Alice should get token back");
            assert.equal(ownerAfter, alice, "Alice should get token back");
        });
    });
});
