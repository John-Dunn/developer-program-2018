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
    const tokenAliceKeeps = 1;
    const tokenBobSells = 2;
    const tokenAliceWantsBobOwns = 3;
    const nonexistingToken = 10;

    before(async function() {
        // Deploy the ERC721 Faucet
        token = await GenericERC721Token.new();

        // Mint a couple of token for Alice and Bob
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new();

        // Approve main contract to withdraw token to be sold
        await token.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});
        await token.approve.sendTransaction(etherary.address, tokenBobSells, {from: bob});
    });


    describe("Hook setup", function () {
        it("should have minted the first two token to Alice", async function () {
            let ownerToken0 = await token.ownerOf.call(tokenAliceSells);
            let ownerToken1 = await token.ownerOf.call(tokenAliceKeeps);
            assert.equal(ownerToken0, alice, "First minted token should be owned by Alice")
            assert.equal(ownerToken0, alice, "Second minted token should be owned by Alice")
        });

        it("should have minted the second batch of token to Alice", async function () {
            let ownerToken2 = await token.ownerOf.call(tokenBobSells);
            let ownerToken3 = await token.ownerOf.call(tokenAliceWantsBobOwns);
            assert.equal(ownerToken2, bob, "First minted token should be owned by Alice")
            assert.equal(ownerToken3, bob, "Second minted token should be owned by Alice")
        });

        it("should have approved the main contract", async function () {
            let approved = await token.getApproved.call(tokenBobSells);
            assert.equal(approved, etherary.address, "should have approved the main contract")
        });
    });



    describe("Opening a sell order", function () {
        it("should not allow creation of a sell order with bad token contract", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    0x0,
                    tokenAliceSells,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with nonexisting token for sale", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    token.address,
                    nonexistingToken,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with unapproved token", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    token.address,
                    tokenAliceKeeps, // Is not approved to be withdrawn by contract
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order with nonexisting wanted token", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    token.address,
                    tokenAliceSells,
                    nonexistingToken,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell order from other account", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    token.address,
                    tokenAliceSells,
                    tokenAliceWantsBobOwns,
                    {from: bob}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of a sell order", async function () {
            await etherary.createERC721Trade.sendTransaction(
                token.address,
                tokenAliceSells,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logTokenContract = log.args._tokenContract;
            const logTokenForSale = log.args._makerTokenId.toNumber()
            const logTokenWanted = log.args._takerTokenId.toNumber()
            const logOrderId = log.args._tradeId.toNumber()

            assert.equal(logTokenContract, token.address, "should emit correct contract address");
            assert.equal(logTokenForSale, tokenAliceSells, "should emit correct token for sale");
            assert.equal(logTokenWanted, tokenAliceWantsBobOwns, "should emit correct token wanted");
            assert.equal(logOrderId, 0, "should emit correct token id");
        });


        it("should not allow creation the same order twice", async function () {
            await exceptions.tryCatch(
                etherary.createERC721Trade.sendTransaction(
                    token.address,
                    tokenAliceSells,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of another sell order", async function () {
            await etherary.createERC721Trade.sendTransaction(
                token.address,
                tokenBobSells,
                tokenAliceWantsBobOwns,
                {from: bob}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logTokenContract = log.args._tokenContract;
            const logTokenForSale = log.args._makerTokenId.toNumber()
            const logTokenWanted = log.args._takerTokenId.toNumber()
            const logOrderId = log.args._tradeId.toNumber()

            assert.equal(logTokenContract, token.address, "should emit correct contract address");
            assert.equal(logTokenForSale, tokenBobSells, "should emit correct token for sale");
            assert.equal(logTokenWanted, tokenAliceWantsBobOwns, "should emit correct token wanted");
            assert.equal(logOrderId, 1, "should emit correct token id");
        });


        it("should allow a sell order to be queried", async function () {
            let Trade = await etherary.idToTrade.call(0);
            // struct Trade {
            //     //AssetType assetType;
            //     address maker;
            //     address taker;
            //     address tokenContract;
            //     uint256 makerTokenId; /// @dev only used for ERC721
            //     uint256 takerTokenId; /// @dev only used for ERC721
            //     bool isActive;
            // }
            assert.equal(Trade[0], alice, "order creator should be alice");
            assert.equal(Trade[2], token.address, "token for sale should be from faucet");
            assert.equal(Trade[3], tokenAliceSells, "token to be sold should be as specified");
            assert.equal(Trade[4], tokenAliceWantsBobOwns, "token to be bought should be as specified");
            assert.equal(Trade[5], true, "order should be active");
        });
    });
});
