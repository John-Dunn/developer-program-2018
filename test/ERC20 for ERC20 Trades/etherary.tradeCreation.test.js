var exceptions = require("../exceptions.js");

var GenericERC20TokenA = artifacts.require('GenericERC20TokenA')
var GenericERC20TokenB = artifacts.require('GenericERC20TokenB')
var Etherary = artifacts.require("Etherary");


contract('Etherary - Creating Trades (ERC20 for ERC20)', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;

    var tokenA;
    var tokenB;
    var etherary;

    // ERC721 trades
    const isERC20 = true;


    // token balances
    var amountMinted;
    var tokenAAliceSells = 20;
    var tokenBBobSells = 5;

    before(async function() {
        // Deploy two ERC721 Faucets
        tokenA = await GenericERC20TokenA.new({gas: 5000000});
        tokenB = await GenericERC20TokenB.new({gas: 5000000});

        var amountMintedBig = await tokenA.AMOUNT_TO_MINT.call();
        amountMinted = amountMintedBig.toNumber();

        // Mint a couple of token for Alice and Bob
        await tokenA.mint.sendTransaction({from: alice, gas:gasForMinting});
        await tokenB.mint.sendTransaction({from: bob, gas:gasForMinting});

        // Deploy main contract
        etherary = await Etherary.new({gas: 5000000});

        // Approve main contract to withdraw token to be sold
        await tokenA.approve.sendTransaction(etherary.address, tokenAAliceSells, {from: alice});
        await tokenB.approve.sendTransaction(etherary.address, tokenBBobSells, {from: bob});
    });


    describe("Hook setup", function () {
        it("should have minted the specified amount of token", async function () {
            let balanceAAlice = await tokenA.balanceOf(alice);
            let balanceBBob = await tokenB.balanceOf(bob);

            assert.equal(amountMinted, balanceAAlice.toNumber(), "Alice should own the minted token from faucet A");
            assert.equal(amountMinted, balanceBBob.toNumber(), "Bob should own the minted token from faucet B");
        });

        it("should have approved the main contract", async function () {
            let allowanceA = await tokenA.allowance(alice, etherary.address);
            let allowanceB = await tokenB.allowance(bob, etherary.address);
            assert.equal(allowanceA.toNumber(), tokenAAliceSells, "this contract should have an allowance of A token");
            assert.equal(allowanceB.toNumber(), tokenBBobSells, "this contract should have an allowance of B token");
        });
    });



    describe("Opening a trade", function () {

        it("should not allow creation of a sell trade with insufficient approved token", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
                    tokenA.address,
                    isERC20,
                    tokenAAliceSells+1,
                    tokenB.address,
                    isERC20,
                    tokenBBobSells,
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
                    tokenAAliceSells,
                    tokenB.address,
                    isERC20,
                    tokenBBobSells,
                    {from: bob}
                ),
                exceptions.errTypes.revert
            );
        });


        it("should allow creation of a trade", async function () {
            await etherary.createTrade.sendTransaction(
                tokenA.address,
                isERC20,
                tokenAAliceSells,
                tokenB.address,
                isERC20,
                tokenBBobSells,
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

            assert.equal(logMakerToken, tokenAAliceSells, "should emit correct token for sale");
            assert.equal(logTakerToken, tokenBBobSells, "should emit correct token wanted");

            assert.equal(logTradeId, 0, "should emit correct token id");
        });


        it("should not allow creation the same trade twice", async function () {
            await exceptions.tryCatch(
                etherary.createTrade.sendTransaction(
                    tokenA.address,
                    isERC20,
                    tokenAAliceSells,
                    tokenB.address,
                    isERC20,
                    tokenBBobSells,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

        it("should allow creation of another trade", async function () {
            await etherary.toggle

            await etherary.createTrade.sendTransaction(
                tokenB.address,
                isERC20,
                tokenBBobSells,
                tokenA.address,
                isERC20,
                tokenAAliceSells,
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

            assert.equal(logMakerToken, tokenBBobSells, "should emit correct token for sale");
            assert.equal(logTakerToken, tokenAAliceSells, "should emit correct token wanted");

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
            assert.equal(Trade[6], tokenAAliceSells, "token to be sold should be as specified");
            assert.equal(Trade[7], tokenBBobSells, "token to be bought should be as specified");
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
                    tokenAAliceSells,
                    tokenB.address,
                    isERC20,
                    tokenBBobSells,
                    {from: alice}
                ),
                exceptions.errTypes.revert
            );
        });

    });
});
