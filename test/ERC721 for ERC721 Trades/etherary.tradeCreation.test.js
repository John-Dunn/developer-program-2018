var exceptions = require("../exceptions.js");

var GenericERC721TokenA = artifacts.require('GenericERC721TokenA')
var GenericERC721TokenB = artifacts.require('GenericERC721TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Creating Trades (ERC721 for ERC721)', function(accounts) {

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
    // ERC721 trades
    const isERC20 = false;

    before(async function() {
        // Deploy two ERC721 Faucets
        tokenA = await GenericERC721TokenA.new({gas: 5000000});
        tokenB = await GenericERC721TokenB.new({gas: 5000000});

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



    describe("Opening a sell trade", function () {

        it("should not allow creation of a sell trade with nonexisting token for sale", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
                    tokenA.address,
                    isERC20,
                    nonexistingToken,
                    tokenB.address,
                    isERC20,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell trade with unapproved token", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
                    tokenA.address,
                    isERC20,
                    tokenAliceKeeps, // Is not approved to be withdrawn by contract
                    tokenB.address,
                    isERC20,
                    tokenAliceWantsBobOwns,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should not allow creation of a sell trade from other account", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
                    tokenA.address,
                    isERC20,
                    tokenAliceSells,
                    tokenB.address,
                    isERC20,
                    tokenAliceWantsBobOwns,
                    {from: bob}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of a trade", async function () {
            await etherary.createTrade.sendTransaction(
                tokenA.address,
                isERC20,
                tokenAliceSells,
                tokenB.address,
                isERC20,
                tokenAliceWantsBobOwns,
                {from: alice}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logMakerTokenContract = log.args._makerTokenContract;
            const logMakerToken = log.args._makerTokenIdOrAmount.toNumber()
            const logTakerTokenContract = log.args._takerTokenContract;
            const logTakerToken = log.args._takerTokenIdOrAmount.toNumber();
            const logTradeId = log.args._tradeId.toNumber();

            assert.equal(logMakerTokenContract, tokenA.address, "should emit correct maker contract address");
            assert.equal(logTakerTokenContract, tokenB.address, "should emit correct taker contract address");

            assert.equal(logMakerToken, tokenAliceSells, "should emit correct token for sale");
            assert.equal(logTakerToken, tokenAliceWantsBobOwns, "should emit correct token wanted");

            assert.equal(logTradeId, 0, "should emit correct token id");
        });


        it("should not allow creation the same trade twice", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
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

        it("should allow creation of another sell trade", async function () {
            await etherary.toggle

            await etherary.createTrade.sendTransaction(
                tokenB.address,
                isERC20,
                tokenBobSells,
                tokenA.address,
                isERC20,
                tokenAliceWantsBobOwns,
                {from: bob}
            );

            // Check for TradeCreated event
            const LogTradeCreated = await etherary.TradeCreated();
            const log = await new Promise(function(resolve, reject) {
                LogTradeCreated.watch(function(error, log){ resolve(log); } );
            });

            const logMakerTokenContract = log.args._makerTokenContract;
            const logMakerToken = log.args._makerTokenIdOrAmount.toNumber()
            const logTakerTokenContract = log.args._takerTokenContract;
            const logTakerToken = log.args._takerTokenIdOrAmount.toNumber();
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
            //     bool isMakerContractERC20; // If false, ERC721
            //     bool isTakerContractERC20; // If false, ERC721
            //     address maker;
            //     address taker;
            //     address makerTokenContract;
            //     address takerTokenContract;
            //     uint256 makerTokenIdOrAmount;
            //     uint256 takerTokenIdOrAmount;
            //     bool isActive;
            // }
            assert.equal(Trade[0], isERC20, "maker contract is ERC721");
            assert.equal(Trade[1], isERC20, "taker contract is ERC721");
            assert.equal(Trade[2], alice, "trade creator should be alice");
            assert.equal(Trade[4], tokenA.address, "token for sale should be from faucet A");
            assert.equal(Trade[5], tokenB.address, "token wanted should be from faucet B");
            assert.equal(Trade[6], tokenAliceSells, "token to be sold should be as specified");
            assert.equal(Trade[7], tokenAliceWantsBobOwns, "token to be bought should be as specified");
            assert.equal(Trade[8], true, "trade should be active");
        });
    });

    describe("Circuit breaker", function () {
        it("should allow contract to be stopped and resumed by owner", async function () {
            await etherary.toggleContractActive.sendTransaction({from: deployer});

            // Check for ContractStopped event
            const LogContractStopped = await etherary.ContractStopped();
            const log = await new Promise(function(resolve, reject) {
                LogContractStopped.watch(function(error, log){ resolve(log); } );
            });
            assert.equal(log.event, 'ContractStopped', "contract should be stopped");

            await etherary.toggleContractActive.sendTransaction({from: deployer});

            // Check for ContractResumed event
            const LogContractResumed = await etherary.ContractResumed();
            const logResume = await new Promise(function(resolve, reject) {
                LogContractResumed.watch(function(error, log){ resolve(log); } );
            });
            assert.equal(logResume.event, 'ContractResumed', "contract should be resumed");
        });

        it("should not allow contract to be stopped by non-owner", async function () {
            await exceptions.tryCatch(
                etherary.toggleContractActive.sendTransaction(
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

        it("should not allow new trade when stopped", async function () {
            await etherary.toggleContractActive.sendTransaction({from: deployer});
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
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
