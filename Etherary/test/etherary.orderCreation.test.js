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
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new();
    });

    const tokenAliceSells = 0;
    const tokenAliceKeeps = 1;
    const tokenBobSells = 2;
    const tokenAliceWantsBobOwns = 3;
    const nonexistingToken = 10;

    before(async function() {
        // Approve main contract to withdraw token to be sold
        await token.approve.sendTransaction(etherary.address, tokenAliceSells, {from: alice});
        await token.approve.sendTransaction(etherary.address, tokenBobSells, {from: bob});
    });



    describe("Opening a sell order", function () {
        it("should not allow creation of a sell order with bad token contract", async function () {
            await exceptions.tryCatch(
                etherary.createERC721SellOrder.sendTransaction(
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
                etherary.createERC721SellOrder.sendTransaction(
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
                etherary.createERC721SellOrder.sendTransaction(
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
                etherary.createERC721SellOrder.sendTransaction(
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
                etherary.createERC721SellOrder.sendTransaction(
                    token.address,
                    tokenAliceSells,
                    tokenAliceWantsBobOwns,
                    {from: bob}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of a sell order", async function () {
            await etherary.createERC721SellOrder.sendTransaction(
                token.address,
                tokenAliceSells,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Check for SellOrderCreated event
            const LogSellOrderCreated = await etherary.SellOrderCreated();
            const log = await new Promise(function(resolve, reject) {
                LogSellOrderCreated.watch(function(error, log){ resolve(log); } );
            });

            const logTokenContract = log.args.tokenContract;
            const logTokenForSale = log.args.tokenForSale.toNumber()
            const logTokenWanted = log.args.tokenWanted.toNumber()
            const logOrderId = log.args.orderId.toNumber()

            assert.equal(logTokenContract, token.address, "should emit correct contract address");
            assert.equal(logTokenForSale, tokenAliceSells, "should emit correct token for sale");
            assert.equal(logTokenWanted, tokenAliceWantsBobOwns, "should emit correct token wanted");
            assert.equal(logOrderId, 0, "should emit correct token id");
        });


        it("should not allow creation the same order twice", async function () {
            await exceptions.tryCatch(
                etherary.createERC721SellOrder.sendTransaction(
                    token.address,
                    tokenAliceSells,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of another sell order", async function () {
            await etherary.createERC721SellOrder.sendTransaction(
                token.address,
                tokenBobSells,
                tokenAliceWantsBobOwns,
                {from: bob}
            );

            // Check for SellOrderCreated event
            const LogSellOrderCreated = await etherary.SellOrderCreated();
            const log = await new Promise(function(resolve, reject) {
                LogSellOrderCreated.watch(function(error, log){ resolve(log); } );
            });

            const logTokenContract = log.args.tokenContract;
            const logTokenForSale = log.args.tokenForSale.toNumber()
            const logTokenWanted = log.args.tokenWanted.toNumber()
            const logOrderId = log.args.orderId.toNumber()

            assert.equal(logTokenContract, token.address, "should emit correct contract address");
            assert.equal(logTokenForSale, tokenBobSells, "should emit correct token for sale");
            assert.equal(logTokenWanted, tokenAliceWantsBobOwns, "should emit correct token wanted");
            assert.equal(logOrderId, 1, "should emit correct token id");
        });


        it("should allow a sell order to be queried", async function () {
            let sellOrder = await etherary.idToSellOrder.call(0);
            // struct SellOrder {
            //     address seller;
            //     address tokenContract;
            //     uint256 tokenForSale;
            //     uint256 tokenWanted;
            //     bool isActive;
            // }
            assert.equal(sellOrder[0], alice, "order creator should be alice");
            assert.equal(sellOrder[1], token.address, "token for sale should be from faucet");
            assert.equal(sellOrder[2], tokenAliceSells, "token to be sold should be as specified");
            assert.equal(sellOrder[3], tokenAliceWantsBobOwns, "token to be bought should be as specified");
            assert.equal(sellOrder[4], true, "order should be active");
        });
    });
});
