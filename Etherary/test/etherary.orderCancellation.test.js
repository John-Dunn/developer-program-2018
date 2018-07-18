var exceptions = require("./exceptions.js");

var json = require("../../ERC721Faucet/build/contracts/GenericERC721Token.json");

var GenericERC721Token = web3.eth.contract(json.abi);
var Etherary = artifacts.require("../../../Etherary/build/contracts/Etherary");


contract('Etherary', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasEstimateDeployment = web3.eth.estimateGas({data: json.bytecode});
    const gasForMinting = 300000;


    var token;
    var etherary;

    // Deploy the ERC721 Faucet
    before(function(done) {
        token = GenericERC721Token.new(
            {data: json.bytecode, from: deployer, gas: gasEstimateDeployment},
            function(err, myContract) {
                if(!err) {
                    // NOTE: The callback will fire twice!
                    // Once the contract has the transactionHash property set and once its deployed on an address.
                    if (!myContract.address) { /* Tx hash is known */ } else { done(); }
                }
            }
        )
    });

    before(async function() {
        // Mint a couple of token for Alice and Bob
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new();
    });

    const tokenAliceSells = 0;
    const tokenAliceWantsBobOwns = 1;
    const orderId = 0;

    before(async function() {
        // Approve main contract to withdraw token to be sold
        await token.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});

        // Create a sell order
        await etherary.createERC721SellOrder.sendTransaction(
            token.address,
            tokenAliceSells,
            tokenAliceWantsBobOwns,
            {from: alice}
        );
    });

    describe("Hook setup", function () {

    });


    describe("Cancelling a sell order", function () {
        it("should not be possible for Bob to cancel Alice's order", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721SellOrder.sendTransaction(orderId, {from: bob}),
                exceptions.errTypes.revert
            );
        });


        it("should not be possible to cancel a nonexisting order", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721SellOrder.sendTransaction(10, {from: alice}),
                exceptions.errTypes.revert
            );
        });


        it("should be possible to cancel your own order", async function () {
            await etherary.cancelERC721SellOrder.sendTransaction(orderId, {from:alice});
            let approvedForToken = await token.getApproved.call(tokenAliceSells);
            assert.equal(approvedForToken, alice, "Alice should be approved to withdraw her token");

            // Check for SellOrderCancelled event
            const LogSellOrderCancelled = await etherary.SellOrderCancelled();
            const log = await new Promise(function(resolve, reject) {
                LogSellOrderCancelled.watch(function(error, log){ resolve(log); } );
            });
            const logOrderId = log.args.orderId.toNumber()
            assert.equal(logOrderId, orderId, "Should emit SellOrderCancelled event with correct orderId");
        });


        it("should be possible to query a cancelled order's status", async function () {
            let sellOrder = await etherary.idToSellOrder.call(orderId);
            // struct SellOrder {
            //     address seller;
            //     address tokenContract;
            //     uint256 tokenForSale;
            //     uint256 tokenWanted;
            //     bool isActive;
            // }
            assert.equal(sellOrder[4], false, "Cancelled Order should be inactive");
        })


        it("should not be possible to cancel an order twice", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721SellOrder.sendTransaction(
                    orderId,
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


    describe("Cancelling a filled order", function () {
        // Deploy a new token contract
        before(function(done) {
            token = GenericERC721Token.new(
                {data: json.bytecode, from: deployer, gas: gasEstimateDeployment},
                function(err, myContract) {
                    if(!err) {
                        // NOTE: The callback will fire twice!
                        // Once the contract has the transactionHash property set and once its deployed on an address.
                        if (!myContract.address) { /* Tx hash is known */ } else { done(); }
                    }
                }
            )
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

            // Create a sell order
            await etherary.createERC721SellOrder.sendTransaction(
                token.address,
                tokenAliceSells,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Fill that order
            await etherary.fillERC721SellOrder.sendTransaction(orderId, {from: bob});
        });

        it("should not be possible to cancel a filled order", async function () {
            await exceptions.tryCatch(
                etherary.cancelERC721SellOrder.sendTransaction(orderId, {from:alice}),
                exceptions.errTypes.revert
            );
        });

    });
});
