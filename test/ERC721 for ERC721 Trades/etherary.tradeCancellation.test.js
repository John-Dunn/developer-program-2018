var exceptions = require("../exceptions.js");

var GenericERC721TokenA = artifacts.require('GenericERC721TokenA')
var GenericERC721TokenB = artifacts.require('GenericERC721TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Cancelling Trades (ERC721 for ERC721)', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA, tokenB
    var etherary;

    const tokenAliceSells = 0;
    const tokenAliceWantsBobOwns = 0; // On other faucet
    const tradeId = 0;
    // ERC721 trades
    const isERC20 = false;

    before(async function() {
        // Deploy the ERC721 Faucet
        tokenA = await GenericERC721TokenA.new({gas: 5000000});
        tokenB = await GenericERC721TokenB.new({gas: 5000000});

        // Mint a couple of token for Alice and Bob
        await tokenA.mint({from: alice, gas:gasForMinting});
        await tokenB.mint({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new();

        // Approve main contract to withdraw token to be sold
        await tokenA.approve(etherary.address, tokenAliceSells, {from: alice});

        // Create a trade
        await etherary.createTrade(
            tokenA.address,
            isERC20,
            tokenAliceSells,
            tokenB.address,
            isERC20,
            tokenAliceWantsBobOwns,
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
            let approvedForToken = await tokenA.getApproved.call(tokenAliceSells);
            assert.equal(approvedForToken, alice, "Alice should be approved to withdraw her token");

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
            let tokenOwnerBefore = await tokenA.ownerOf.call(tokenAliceSells);
            let approvedAddressBefore = await tokenA.getApproved.call(tokenAliceSells);
            await tokenA.safeTransferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAliceSells,
                {from:alice, gas: gasForMinting}
            );
            let tokenOwnerAfter = await tokenA.ownerOf.call(tokenAliceSells);
            let approvedAddressAfter = await tokenA.getApproved.call(tokenAliceSells);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should be owned by contract initially");
            assert.equal(approvedAddressBefore, alice, "Alice should be approved to withdraw after cancelling");
            assert.equal(tokenOwnerAfter, alice, "Token should be owned by alice after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        });



    });


    describe("Cancelling a filled trade", function () {
        // Deploy a new token contract
        before(async function() {
            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});
            // Mint token for Alice and Bob
            await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
            await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});
            // Deploy new main contract
            etherary = await Etherary.new();
            // Approve main contract to withdraw token to be sold and bought
            await tokenA.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});
            await tokenB.approve.sendTransaction(etherary.address, tokenAliceWantsBobOwns, {from: bob});
            // Create a trade
            await etherary.createTrade.sendTransaction(
                tokenA.address,
                isERC20,
                tokenAliceSells,
                tokenB.address,
                isERC20,
                tokenAliceWantsBobOwns,
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
            // Deploy the ERC721 Faucet
            tokenA = await GenericERC721TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAliceSells, {from: alice});

            // Create a trade
            await etherary.createTrade(
                tokenA.address,
                isERC20,
                tokenAliceSells,
                tokenB.address,
                isERC20,
                tokenAliceWantsBobOwns,
                {from: alice}
            );
        });

        it("should be possible to cancel a trade and withdraw token while stopped", async function () {
            const tokenOwnerBefore = await tokenA.ownerOf.call(tokenAliceSells);
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await etherary.cancelTrade.sendTransaction(tradeId, {from:alice});
            await tokenA.safeTransferFrom.sendTransaction(
                etherary.address,
                alice,
                tokenAliceSells,
                {from:alice, gas: gasForMinting}
            );
            const tokenOwnerAfter = await tokenA.ownerOf(tokenAliceSells);
            assert.equal(tokenOwnerBefore, etherary.address, "Token should be owned by contract before cancelling");
            assert.equal(tokenOwnerAfter, alice, "Token should be owned by alice after cancelling and withdrawing");
            assert.isTrue(true);
        });
    });
});
