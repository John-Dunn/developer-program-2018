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


    describe("Filling a trade", function () {
        it("should not be possible to fill a nonexisting order", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721Trade.sendTransaction(10, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should not be possible for Bob to fill Alice's order without approving the token", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721Trade.sendTransaction(tradeId, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should be possible to fill an order after approving the withdrawal", async function () {
            // Approve bob's token to be transferred by the contract
            await token.approve.sendTransaction(etherary.address, tokenAliceWantsBobOwns, {from: bob});
            await etherary.fillERC721Trade.sendTransaction(tradeId, {from:bob});

            // Check for TradeFilled event
            const LogTradeFilled = await etherary.TradeFilled();
            const log = await new Promise(function(resolve, reject) {
                LogTradeFilled.watch(function(error, log){ resolve(log); } );
            });
            const logtradeId = log.args._tradeId.toNumber()
            assert.equal(logtradeId, tradeId, "Should emit TradeFilled event with correct tradeId");
        });

        it("should be possible to query a filled order's status", async function () {
            let Trade = await etherary.idToTrade.call(tradeId);
            assert.equal(Trade[5], false, "Cancelled Order should be inactive");
        })

        it("should be possible for seller to withdraw the token after order is filled", async function () {
            let alicesNewToken = tokenAliceWantsBobOwns;
            let tokenOwnerBefore = await token.ownerOf.call(alicesNewToken);
            let approvedAddressBefore = await token.getApproved.call(alicesNewToken);

            await token.safeTransferFrom.sendTransaction(
                etherary.address,
                alice,
                alicesNewToken,
                {from:alice, gas: gasForMinting}
            );

            let tokenOwnerAfter = await token.ownerOf.call(alicesNewToken);
            let approvedAddressAfter = await token.getApproved.call(alicesNewToken);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should initially be owned by contract after trade");
            assert.equal(approvedAddressBefore, alice, "Alice should be approved to withdraw after order is filled");
            assert.equal(tokenOwnerAfter, alice, "Token should be owned by alice after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        })

        it("should be possible for buyer to withdraw the token after order is filled", async function () {
            let bobsNewToken = tokenAliceSells;

            let tokenOwnerBefore = await token.ownerOf.call(bobsNewToken);
            let approvedAddressBefore = await token.getApproved.call(bobsNewToken);

            await token.safeTransferFrom.sendTransaction(
                etherary.address,
                bob,
                bobsNewToken,
                {from:bob, gas: gasForMinting}
            );

            let tokenOwnerAfter = await token.ownerOf.call(bobsNewToken);
            let approvedAddressAfter = await token.getApproved.call(bobsNewToken);

            assert.equal(tokenOwnerBefore, etherary.address, "Token should initially be owned by contract after trade");
            assert.equal(approvedAddressBefore, bob, "Bob should be approved to withdraw after order is filled");
            assert.equal(tokenOwnerAfter, bob, "Token should be owned by bob after transfer");
            assert.equal(approvedAddressAfter, 0x0, "Nobody should be approved after transfer");
        });

    });



    describe("Filling a cancelled order", function () {
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
            await etherary.cancelERC721Trade.sendTransaction(tradeId, {from: alice});
        });

        it("should not be possible to fill a cancelled order", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721Trade.sendTransaction(tradeId, {from:bob}),
                exceptions.errTypes.revert
            );
        });

    });
});
