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
        // Approve main contract to withdraw token to be sold and bought
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


    describe("Filling a sell order", function () {
        it("should not be possible to fill a nonexisting order", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721SellOrder.sendTransaction(10, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should not be possible for Bob to fill Alice's order without approving the token", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721SellOrder.sendTransaction(orderId, {from: bob}),
                exceptions.errTypes.revert
            );
        });

        it("should be possible to fill an order after approving the withdrawal", async function () {
            // Approve bob's token to be transferred by the contract
            await token.approve.sendTransaction(etherary.address, tokenAliceWantsBobOwns, {from: bob});
            await etherary.fillERC721SellOrder.sendTransaction(orderId, {from:bob});

            // Check for SellOrderFilled event
            const LogSellOrderFilled = await etherary.SellOrderFilled();
            const log = await new Promise(function(resolve, reject) {
                LogSellOrderFilled.watch(function(error, log){ resolve(log); } );
            });
            const logOrderId = log.args.orderId.toNumber()
            assert.equal(logOrderId, orderId, "Should emit SellOrderFilled event with correct orderId");
        });

        it("should be possible to query a filled order's status", async function () {
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

            // Cancel that order
            await etherary.cancelERC721SellOrder.sendTransaction(orderId, {from: alice});
        });

        it("should not be possible to fill a cancelled order", async function () {
            await exceptions.tryCatch(
                etherary.fillERC721SellOrder.sendTransaction(orderId, {from:bob}),
                exceptions.errTypes.revert
            );
        });

    });
});
