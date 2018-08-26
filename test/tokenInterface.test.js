var exceptions = require("./exceptions.js");

var ERC20Token = artifacts.require('GenericERC20TokenA')
var ERC721Token = artifacts.require('GenericERC721TokenA')
var TokenInterface = artifacts.require("TokenInterface");


contract('TokenInterface', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const gasForMinting = 300000;
    const amountERC20Minted = web3.toWei(100);


    var token20;
    var token721;
    var tokenInterface;

    before(async function() {
        // Deploy two Faucets
        token20 = await ERC20Token.new({gas: 5000000});
        token721 = await ERC721Token.new({gas: 5000000});
        // Mint token from each
        await token20.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token721.mint.sendTransaction({from: alice, gas:gasForMinting});

        tokenInterface = await TokenInterface.new({gas: 5000000});
        await token20.approve(tokenInterface.address, amountERC20Minted, {from:alice});
        await token721.approve(tokenInterface.address, 0, {from:alice});
    });

    // function isOwned (
    //     address _contractAddress,
    //     bool _isERC20,
    //     address _caller,
    //     uint256 _tokenAmountOrId
    // )
    describe("isOwned", function () {
        it("should correctly identify owned ERC20 token", async function () {
            let isOwned = await tokenInterface.isOwned.call(token20.address, true, alice, amountERC20Minted);
            assert.equal(isOwned, true, "alice owns the token")
        });

        it("should correctly identify not owned ERC20 token", async function () {
            let isOwned = await tokenInterface.isOwned.call(token20.address, true, alice, amountERC20Minted + 1);
            assert.equal(isOwned, false, "alice does not own the token")
        });

        it("should correctly identify not owned ERC20 token", async function () {
            let isOwned = await tokenInterface.isOwned.call(token20.address, true, bob, amountERC20Minted);
            assert.equal(isOwned, false, "bob owns no token")
        });


        it("should correctly identify owned ERC721 token", async function () {
            let isOwned = await tokenInterface.isOwned.call(token721.address, false, alice, 0);
            assert.equal(isOwned, true, "alice owns the token")
        });

        it("should throw for unminted ERC721 token", async function () {
            await exceptions.tryCatch(
                tokenInterface.isOwned.call(token721.address, false, alice, 1),
                exceptions.errTypes.revert
            );
        });

        it("should correctly identify not owned ERC721 token", async function () {
            let isOwned = await tokenInterface.isOwned.call(token721.address, false, bob, 0);
            assert.equal(isOwned, false, "bob owns no token")
        });
    });

    // function isApproved (
    //     address _contractAddress,
    //     bool _isERC20,
    //     address _caller,
    //     address _spender,
    //     uint256 _tokenAmountOrId
    // )
    describe("isApproved", function () {
        it("should correctly identify approved ERC20 token", async function () {
            let isApproved = await tokenInterface.isApproved.call(token20.address, true, alice, tokenInterface.address, amountERC20Minted);
            assert.equal(isApproved, true, "alice has approved this token")
        });

        it("should correctly identify unapproved ERC20 token", async function () {
            let isApproved = await tokenInterface.isApproved.call(token20.address, true, alice, tokenInterface.address, amountERC20Minted+1);
            assert.equal(isApproved, false, "alice has not approved this token")
        });

        it("should correctly identify unapproved ERC20 token", async function () {
            let isApproved = await tokenInterface.isApproved.call(token20.address, true, bob, tokenInterface.address, 1);
            assert.equal(isApproved, false, "bob has not approved this token")
        });


        it("should correctly identify approved ERC721 token", async function () {
            let isApproved = await tokenInterface.isApproved.call(token721.address, false, alice, tokenInterface.address, 0);
            assert.equal(isApproved, true, "alice has approved this token")
        });

        it("should correctly identify unapproved ERC721 token", async function () {
            let isApproved = await tokenInterface.isApproved.call(token721.address, false, alice, tokenInterface.address, 1);
            assert.equal(isApproved, false, "alice has not approved this token")
        });
    });


    // function transferFrom (
    //     address _contractAddress,
    //     bool _isERC20,
    //     address _from,
    //     address _to,
    //     uint256 _tokenAmountOrId
    // )
    describe("transferFrom", function () {
        var ERC20toTransfer = 50
        it("should correctly transfer approved ERC20 token", async function () {
            let balanceBefore = await token20.balanceOf.call(alice);
            await tokenInterface.transferFrom(token20.address, true, alice, deployer, ERC20toTransfer, {from:deployer, gas:500000});
            let balanceAfterAlice = await token20.balanceOf.call(alice);
            let balanceAfterRecipient = await token20.balanceOf.call(deployer);

            assert.equal(balanceBefore.toNumber(), amountERC20Minted, "alice should have minted balance before")
            assert.equal(balanceAfterAlice.toNumber(), amountERC20Minted - ERC20toTransfer, "alice should have lost transferred token")
            assert.equal(balanceAfterRecipient.toNumber(), ERC20toTransfer, "recipient should have gained that token")
        });

        it("should not transfer more than approved ERC20 token", async function () {
            await exceptions.tryCatch(
                tokenInterface.transferFrom(token20.address, true, alice, deployer, amountERC20Minted+1, {from:deployer, gas:500000}),
                exceptions.errTypes.revert
            );
        });

        it("should not transfer from someone else", async function () {
            await exceptions.tryCatch(
                tokenInterface.transferFrom(token20.address, true, bob, deployer, amountERC20Minted, {from:deployer, gas:500000}),
                exceptions.errTypes.revert
            );
        });

        // ERC721 transfers hard to test this way since safeTransferFrom is used and the recipient has to implement the interface
    });

    // function approve (
    //     address _contractAddress,
    //     bool _isERC20,
    //     address _spender,
    //     uint256 _tokenAmountOrId,
    //     address _currentOwner
    // )
    describe("approve", function () {
        var ERC20toTransfer = 50
        it("should approve ERC20 token", async function () {
            await tokenInterface.transferFrom(token20.address, true, alice, deployer, ERC20toTransfer, {from:deployer, gas:500000});
            await tokenInterface.approve(token20.address, true, alice, ERC20toTransfer, tokenInterface.address, {from:deployer, gas:500000});
            let allowanceAlice = await token20.allowance.call(tokenInterface.address, alice);
            assert.equal(allowanceAlice, ERC20toTransfer, "alice have appropriate allowance")
        });
    });

});
