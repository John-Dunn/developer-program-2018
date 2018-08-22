var exceptions = require("../exceptions.js");

var GenericERC721TokenA = artifacts.require('GenericERC721TokenA');
var GenericERC721TokenB = artifacts.require('GenericERC721TokenB');
var Etherary = artifacts.require("Etherary");

contract('Etherary - Complete Trades (ERC721 for ERC721)', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA;
    var tokenB;
    var etherary;

    // These tokens will be from faucet A
    const tokenAliceSells = 0;
    // Token from faucet B
    const tokenAliceWantsBobOwns = 0;

    const tradeId = 0;
    const nonexistingToken = 10;
    // ERC721 trades
    const isERC20 = false;

    before(async function() {
        // Deploy two ERC721 Faucets
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
            await tokenB.approve.sendTransaction(etherary.address, tokenAliceWantsBobOwns, {from: bob});
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
            assert.equal(Trade[6], false, "Cancelled trade should be inactive");
        })

        it("should be possible for seller to withdraw the token after trade is filled", async function () {
            let alicesNewToken = tokenAliceWantsBobOwns;
            let tokenOwnerBefore = await tokenB.ownerOf.call(alicesNewToken);
            let approvedAddressBefore = await tokenB.getApproved.call(alicesNewToken);

            await tokenB.safeTransferFrom.sendTransaction(
                etherary.address,
                alice,
                alicesNewToken,
                {from:alice, gas: gasForMinting}
            );

            let tokenOwnerAfter = await tokenB.ownerOf.call(alicesNewToken);
            let approvedAddressAfter = await tokenB.getApproved.call(alicesNewToken);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should initially be owned by contract after trade");
            assert.equal(approvedAddressBefore, alice, "Alice should be approved to withdraw after trade is filled");
            assert.equal(tokenOwnerAfter, alice, "Token should be owned by alice after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        })

        it("should be possible for buyer to withdraw the token after trade is filled", async function () {
            let bobsNewToken = tokenAliceSells;

            let tokenOwnerBefore = await tokenA.ownerOf.call(bobsNewToken);
            let approvedAddressBefore = await tokenA.getApproved.call(bobsNewToken);

            await tokenA.safeTransferFrom.sendTransaction(
                etherary.address,
                bob,
                bobsNewToken,
                {from:bob, gas: gasForMinting}
            );

            let tokenOwnerAfter = await tokenA.ownerOf.call(bobsNewToken);
            let approvedAddressAfter = await tokenA.getApproved.call(bobsNewToken);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should initially be owned by contract after trade");
            assert.equal(approvedAddressBefore, bob, "Bob should be approved to withdraw after trade is filled");
            assert.equal(tokenOwnerAfter, bob, "Token should be owned by bob after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        });

    });



    describe("Filling a cancelled trade", function () {
        before(async function() {
            // Deploy two ERC721 Faucets
            tokenA = await GenericERC721TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAliceSells, {from: alice});
            await tokenB.approve(etherary.address, tokenAliceWantsBobOwns, {from: bob});

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
            tokenA = await GenericERC721TokenA.new({gas: 5000000});
            tokenB = await GenericERC721TokenB.new({gas: 5000000});

            // Mint a couple of token for Alice and Bob
            await tokenA.mint({from: alice, gas:gasForMinting});
            await tokenB.mint({from: bob, gas:gasForMinting});

            // Deploy main contract
            etherary = await Etherary.new();

            // Approve main contract to withdraw token to be sold
            await tokenA.approve(etherary.address, tokenAliceSells, {from: alice});
            await tokenB.approve(etherary.address, tokenAliceWantsBobOwns, {from: bob});
        });

        it("should not be possible to create a trade while stopped", async function () {
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await exceptions.tryCatch(
                etherary.createTrade(
                    tokenA.address,
                    isERC20,
                    tokenAliceSells,
                    tokenB.address,
                    isERC20,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

    });
});
