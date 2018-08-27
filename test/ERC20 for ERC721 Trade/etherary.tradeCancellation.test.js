var exceptions = require("../exceptions.js");

var GenericERC20TokenA = artifacts.require('GenericERC20TokenA')
var GenericERC721TokenB = artifacts.require('GenericERC721TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Cancelling Trades (ERC20 for ERC721)', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA;
    var tokenB;
    var etherary;

    // ERC721 trades
    const isMakerERC20 = true;
    const isTakerERC20 = false;


    // token balances
    var amountMinted;
    var tokenAAliceSells = 20;
    var tokenBBobSells = 0;

    var tradeId = 0;

    before(async function() {
        // Deploy two ERC721 Faucets
        tokenA = await GenericERC20TokenA.new({gas: 5000000});
        tokenB = await GenericERC721TokenB.new({gas: 5000000});

        var amountMintedBig = await tokenA.AMOUNT_TO_MINT.call();
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
            let allowance = await tokenA.allowance.call(etherary.address, alice);
            assert.equal(allowance, tokenAAliceSells, "Alice should be approved to withdraw her token");

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
            let balanceBefore = await tokenA.balanceOf.call(alice);
            await tokenA.transferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAAliceSells,
                {from:alice, gas: gasForMinting}
            );
            let balanceAfter = await tokenA.balanceOf.call(alice);

            assert.equal(balanceBefore, balanceAfter - tokenAAliceSells, "Alice's balance should increase after withdrawing");
        });
    });


    describe("Cancelling a filled trade", function () {
        // Deploy a new token contract
        before(async function() {
            // Deploy two ERC721 Faucets
            tokenA = await GenericERC20TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});
            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});
            // Mint token for Alice and Bob
            await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
            await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});
            // Deploy new main contract
            etherary = await Etherary.new();
            // Approve main contract to withdraw token to be sold and bought
            await tokenA.approve.sendTransaction(etherary.address, tokenAAliceSells, {from: alice});
            await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});

            // Create a trade
            await etherary.createTrade.sendTransaction(
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
            // Deploy two Faucets
            tokenA = await GenericERC20TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAAliceSells, {from: alice});

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
            const balanceBefore = await tokenA.balanceOf.call(alice);
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await etherary.cancelTrade.sendTransaction(tradeId, {from:alice});
            await tokenA.transferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAAliceSells,
                {from:alice, gas: gasForMinting}
            );
            const balanceAfter = await tokenA.balanceOf.call(alice);
            assert.equal(balanceBefore.toNumber() + tokenAAliceSells, balanceAfter.toNumber(), "Alice should get token back");
        });
    });
});
