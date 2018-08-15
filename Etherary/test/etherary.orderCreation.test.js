var exceptions = require("./exceptions.js");

var GenericERC721Token = artifacts.require('GenericERC721Token')
var Etherary = artifacts.require("Etherary");


contract('Etherary', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA;
    var tokenB;
    var etherary;

    // These tokens will be from faucet A
    const tokenAliceSells = 0;
    const tokenAliceKeeps = 1;
    // Token from faucet B
    const tokenBobSells = 0;
    const tokenAliceWantsBobOwns = 1;
    const nonexistingToken = 10;

    before(async function() {
        // Deploy two ERC721 Faucets
        tokenA = await GenericERC721Token.new({gas: 5000000});
        tokenB = await GenericERC721Token.new({gas: 5000000});

        // Mint a couple of token for Alice and Bob
        await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
        await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
        await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});
        await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new({gas: 5000000});

        // Approve main contract to withdraw token to be sold
        await tokenA.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});
        await tokenB.approve.sendTransaction(etherary.address, tokenBobSells, {from: bob});
    });


    describe("Hook setup", function () {
        it("should have minted the first two token to Alice", async function () {
            let ownerToken0 = await tokenA.ownerOf.call(tokenAliceSells);
            let ownerToken1 = await tokenA.ownerOf.call(tokenAliceKeeps);
            assert.equal(ownerToken0, alice, "First minted token should be owned by Alice")
            assert.equal(ownerToken0, alice, "Second minted token should be owned by Alice")
        });

        it("should have minted the second batch of token to Bob on the other contract", async function () {
            let ownerToken0 = await tokenB.ownerOf.call(tokenBobSells);
            let ownerToken1 = await tokenB.ownerOf.call(tokenAliceWantsBobOwns);
            assert.equal(ownerToken0, bob, "First minted token should be owned by Bob")
            assert.equal(ownerToken1, bob, "Second minted token should be owned by Bob")
        });

        it("should have approved the main contract", async function () {
            let approvedA = await tokenA.getApproved.call(tokenAliceSells);
            let approvedB = await tokenB.getApproved.call(tokenBobSells);
            assert.equal(approvedA && approvedB, etherary.address, "should have approved the main contract")
        });
    });



    describe("Opening a sell order", function () {
        it("should not allow creation of a sell order with bad token contract", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    0x0,
                    tokenAliceSells,
                    0x0,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with nonexisting token for sale", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    tokenA.address,
                    nonexistingToken,
                    tokenB.address,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with unapproved token", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    tokenA.address,
                    tokenAliceKeeps, // Is not approved to be withdrawn by contract
                    tokenB.address,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with nonexisting wanted token", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    tokenA.address,
                    tokenAliceSells,
                    tokenB.address,
                    nonexistingToken,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order from other account", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    tokenA.address,
                    tokenAliceSells,
                    tokenB.address,
                    tokenAliceWantsBobOwns,
                    {from: bob}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of a trade", async function () {
            await etherary.createERC721Trade.sendTransaction(
                tokenA.address,
                tokenAliceSells,
                tokenB.address,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logMakerTokenContract = log.args._makerTokenContract;
            const logMakerToken = log.args._makerTokenId.toNumber()
            const logTakerTokenContract = log.args._takerTokenContract;
            const logTakerToken = log.args._takerTokenId.toNumber();
            const logTradeId = log.args._tradeId.toNumber();

            assert.equal(logMakerTokenContract, tokenA.address, "should emit correct maker contract address");
            assert.equal(logTakerTokenContract, tokenB.address, "should emit correct taker contract address");

            assert.equal(logMakerToken, tokenAliceSells, "should emit correct token for sale");
            assert.equal(logTakerToken, tokenAliceWantsBobOwns, "should emit correct token wanted");

            assert.equal(logTradeId, 0, "should emit correct token id");
        });


        it("should not allow creation the same order twice", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    tokenA.address,
                    tokenAliceSells,
                    tokenB.address,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of another sell order", async function () {
            await etherary.createERC721Trade.sendTransaction(
                tokenB.address,
                tokenBobSells,
                tokenA.address,
                tokenAliceWantsBobOwns,
                {from: bob}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logMakerTokenContract = log.args._makerTokenContract;
            const logMakerToken = log.args._makerTokenId.toNumber()
            const logTakerTokenContract = log.args._takerTokenContract;
            const logTakerToken = log.args._takerTokenId.toNumber();
            const logTradeId = log.args._tradeId.toNumber();

            assert.equal(logMakerTokenContract, tokenB.address, "should emit correct maker contract address");
            assert.equal(logTakerTokenContract, tokenA.address, "should emit correct taker contract address");

            assert.equal(logMakerToken, tokenBobSells, "should emit correct token for sale");
            assert.equal(logTakerToken, tokenAliceWantsBobOwns, "should emit correct token wanted");

            assert.equal(logTradeId, 1, "should emit correct token id");
        });


        it("should allow a trade to be queried", async function () {
            let Trade = await etherary.idToTrade.call(0);
            // struct Trade {
            //     //AssetType assetType;
            //     address maker;
            //     address taker;
            //     address makerTokenContract;
            //     address takerTokenContract;
            //     uint256 makerTokenId; /// @dev only used for ERC721
            //     uint256 takerTokenId; /// @dev only used for ERC721
            //     bool isActive;
            // }
            assert.equal(Trade[0], alice, "order creator should be alice");
            assert.equal(Trade[2], tokenA.address, "token for sale should be from faucet A");
            assert.equal(Trade[3], tokenB.address, "token wanted should be from faucet B");
            assert.equal(Trade[4], tokenAliceSells, "token to be sold should be as specified");
            assert.equal(Trade[5], tokenAliceWantsBobOwns, "token to be bought should be as specified");
            assert.equal(Trade[6], true, "order should be active");
        });
    });
});
