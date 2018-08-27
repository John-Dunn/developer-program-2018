var exceptions = require("../exceptions.js");

var GenericERC20TokenA = artifacts.require('GenericERC20TokenA')
var GenericERC721TokenB = artifacts.require('GenericERC721TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Filling Trades (ERC20 for ERC721)', function(accounts) {

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
        // Deploy two Faucets
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

    describe("Filling a trade", function () {
        it("should not be possible to fill a nonexisting trade", async function () {
            await exceptions.tryCatch(
                etherary.fillTrade.sendTransaction(10, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should not be possible for Bob to fill Alice's trade without approving the token", async function () {
            await exceptions.tryCatch(
                etherary.fillTrade.sendTransaction(tradeId, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should be possible to fill an trade after approving the withdrawal", async function () {
            // Approve bob's token to be transferred by the contract
            await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});
            await etherary.fillTrade.sendTransaction(tradeId, {from:bob});

            // Check for TradeCompleted event
            const LogTradeCompleted = await etherary.TradeCompleted();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCompleted.watch(function(error, log){ resolve(log); } );
            });
            const logtradeId = log.args._tradeId.toNumber()
            assert.equal(logtradeId, tradeId, "Should emit TradeCompleted event with correct tradeId");
        });

        it("should be possible to query a filled trade's status", async function () {
            let Trade = await etherary.idToTrade.call(tradeId);
            assert.equal(Trade[8], false, "Cancelled trade should be inactive");
        })

        it("should be possible for seller to withdraw the token after trade is filled", async function () {
            let ownerBefore = await tokenB.ownerOf(tokenBBobSells);

            await tokenB.transferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenBBobSells,
                {from:alice, gas: gasForMinting}
            );

            let ownerAfter = await tokenB.ownerOf(tokenBBobSells);

            assert.equal(ownerBefore, etherary.address, "token should be owned by contract before withdrawal");
            assert.equal(ownerAfter, alice, "token should be owned by alice after withdrawal");
        })

        it("should be possible for buyer to withdraw the token after trade is filled", async function () {
            let bobBalanceABefore = await tokenA.balanceOf(bob);

            await tokenA.transferFrom.sendTransaction(
                etherary.address,
                bob,
                tokenAAliceSells,
                {from:bob, gas: gasForMinting}
            );

            let bobBalanceAAfter = await tokenA.balanceOf(bob);

            assert.equal(bobBalanceABefore.toNumber(), 0, "Bob should have no token A before trade");
            assert.equal(bobBalanceAAfter.toNumber(), tokenAAliceSells, "Bob should have token A after trade");
        });

    });



    describe("Filling a cancelled trade", function () {
        before(async function() {
            // Deploy two ERC721 Faucets
            tokenA = await GenericERC20TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAAliceSells, {from: alice});
            await tokenB.approve(etherary.address, tokenBBobSells, {from: bob});

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
            await etherary.cancelTrade.sendTransaction(tradeId, {from: alice});
        });

        it("should not be possible to fill a cancelled trade", async function () {
            await exceptions.tryCatch(
                etherary.fillTrade.sendTransaction(tradeId, {from:bob}),
                exceptions.errTypes.revert
            );
        });
    });


    describe("Circuit Breaker", function () {
        before(async function() {
            // Deploy two ERC721 Faucets
            tokenA = await GenericERC20TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAAliceSells, {from: alice});
            await tokenB.approve(etherary.address, tokenBBobSells, {from: bob});
        });

        it("should not be possible to create a trade while stopped", async function () {
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await exceptions.tryCatch(
                etherary.createTrade(
                    tokenA.address,
                    isMakerERC20,
                    tokenAAliceSells,
                    tokenB.address,
                    isTakerERC20,
                    tokenBBobSells,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

    });
});
