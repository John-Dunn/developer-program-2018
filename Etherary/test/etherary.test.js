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

    before(function(done) {
        token = GenericERC721Token.new(
            {data: json.bytecode, from: deployer, gas: gasEstimateDeployment},
            function(err, myContract) {
                if(!err) {
                    // NOTE: The callback will fire twice!
                    // Once the contract has the transactionHash property set and once its deployed on an address.
                    if(!myContract.address) {
                        // Tx hash is known
                    } else {
                        done();
                    }
                }
            }
        )
    });

    before(async function() {
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: alice, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});
        await token.mint.sendTransaction({from: bob, gas:gasForMinting});
    });

    before(function() {
        return Etherary.new()
        .then(function(instance) {
           etherary = instance;
        });
    });

    describe("Hook Setup", function () {
        it("should have minted token 0 and 1 to alice", async function () {
            let ownerToken0 = await token.ownerOf.call(0);
            let ownerToken1 = await token.ownerOf.call(1);
            let balance = await token.balanceOf.call(alice).toNumber();


            assert.equal(alice, ownerToken0, "alice should own first minted token");
            assert.equal(alice, ownerToken1, "alice should own second minted token");
            assert.equal(balance, 2, "alice should own two token");
        });

        it("should have minted 2 and 3 to bob", async function () {
            let ownerToken2 = await token.ownerOf.call(2);
            let ownerToken3 = await token.ownerOf.call(3);
            let balance = await token.balanceOf.call(alice).toNumber();

            assert.equal(bob, ownerToken2, "bob should own third minted token");
            assert.equal(bob, ownerToken3, "bob should own fourth minted token");
            assert.equal(balance, 2, "bob should own two token");
        });

        it("should have minted a total of 4 token", async function () {
            let supply = await token.totalSupply.call();
            assert.equal(supply, 4, "supply should be 4");
        });


    });




    //
    // it("should allow minting", async function() {
    //     await token.mint.sendTransaction({from: alice, gas:300000});
    //     let balanceAfter = await token.balanceOf.call(alice).toNumber();
    //
    //     assert.equal(2, 3, "balance should increase");
    // })
    //
    // it("should have order number 0", async() => {
    //     let orderNumber = await etherary.orderNumber.call();
    //
    //     assert.equal(orderNumber.valueOf(), 0, 'orderNumber should be 0');
    // })



});
































//
// // Step 1: Get a contract into my application
// //var json = require("../ERC721Faucet/build/contracts/GenericERC721Token.json");
// var json = require("../../ERC721Faucet/build/contracts/GenericERC721Token.json");
//
// // Step 2: Turn that contract into an abstraction I can use
// var contract = require("truffle-contract");
// var GenericERC721Token = contract(json);
// //var Etherary = artifacts.require('Etherary')
// //const web3Abi = require('web3-eth-abi');
//
// contract('GenericERC721Token', function(accounts) {
//
//     const deployer = accounts[0]
//     const alice = accounts[1]
//     const bob = accounts[2]
//
//     var token;
//
//     beforeEach(function() {
//        return GenericERC721Token.new()
//        .then(function(instance) {
//           token = instance;
//        });
//     });
//
//     it("should have no supply initially", async() => {
//         let tokenBalanceDeployer = await token.balanceOf.call(deployer);
//         let tokenBalanceAlice = await token.balanceOf.call(alice);
//         let tokenBalanceBob = await token.balanceOf.call(deployer);
//         let totalSupply = await token.totalSupply.call();
//
//         assert.equal(tokenBalanceDeployer.valueOf(), 0, 'balance of deployer should be 0');
//         assert.equal(tokenBalanceAlice.valueOf(), 0, 'balance of alice should be 0');
//         assert.equal(tokenBalanceBob.valueOf(), 0, 'balance of bob should be 0');
//         assert.equal(totalSupply.valueOf(), 0, 'total supply should be 0');
//     })
//
//
//
//
//
// // contract('Etherary', function(accounts) {
// //     GenericERC721Token.deployed().then(function(deployed) {
// //         console.log(deployed)
// //       //return deployed.someFunction();
// //     });
// //
// //     var token;
// //
// //     beforeEach(function() {
// //        return GenericERC721Token.new()
// //        .then(function(instance) {
// //           token = instance;
// //        });
// //     });
// //
// //     const deployer = accounts[0]
// //     const alice = accounts[1]
// //     const bob = accounts[2]
// //     console.log(deployer)
// //     console.log(alice)
// //     console.log(bob)
// //
// //
// //     it("should return true", async() => {
// //         assert.equal(1, 1, 'balance of deployer should be 0');
// //     })
//
//
//
//     //
//     // it("should have no supply initially", async() => {
//     //     let tokenBalanceDeployer = await token.balanceOf.call(deployer);
//     //     let tokenBalanceAlice = await token.balanceOf.call(alice);
//     //     let tokenBalanceBob = await token.balanceOf.call(deployer);
//     //     let totalSupply = await token.totalSupply.call();
//     //
//     //     assert.equal(tokenBalanceDeployer.valueOf(), 0, 'balance of deployer should be 0');
//     //     assert.equal(tokenBalanceAlice.valueOf(), 0, 'balance of alice should be 0');
//     //     assert.equal(tokenBalanceBob.valueOf(), 0, 'balance of bob should be 0');
//     //     assert.equal(totalSupply.valueOf(), 0, 'total supply should be 0');
//     // })
//     //
//     //
//     // it("should have no ether after deployment", async() => {
//     //     //const token = await GenericERC20Token.deployed()
//     //     var ethBalanceContract = await web3.eth.getBalance(token.address).toNumber()
//     //
//     //     assert.equal(ethBalanceContract, 0, 'contract should have no ether');
//     // })
//     //
//     //
//     // it("should mint token to sender if called without arguments", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //
//     //     var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobBefore = await token.balanceOf.call(bob);
//     //     var totalSupplyBefore = await token.totalSupply.call();
//     //
//     //     await token.mint.sendTransaction({from: alice});
//     //
//     //     var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobAfter = await token.balanceOf.call(bob);
//     //     var totalSupplyAfter = await token.totalSupply.call();
//     //
//     //     assert.equal(
//     //         totalSupplyBefore.valueOf(),
//     //         0,
//     //         'total supply should be 0 in the beginning'
//     //     )
//     //     assert.equal(
//     //         tokenBalanceAliceBefore.valueOf(),
//     //         0,
//     //         'sender should have no token in the beginning'
//     //     )
//     //     assert.equal(
//     //         tokenBalanceBobBefore.valueOf(),
//     //         0,
//     //         'third party should have no token in the beginning'
//     //     )
//     //     assert.equal(
//     //         tokenBalanceAliceAfter.valueOf(),
//     //         expectedTokenMinted,
//     //         'sender should have received token'
//     //     )
//     //     assert.equal(
//     //         tokenBalanceBobAfter.valueOf(),
//     //         0,
//     //         'third party balance should be unchanged'
//     //     )
//     //     assert.equal(
//     //         totalSupplyAfter.valueOf(),
//     //         expectedTokenMinted,
//     //         'total supply should increase after minting'
//     //     )
//     // })
//     //
//     //
//     // it("should mint to given address if provided", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //     var stringAddress = web3.toAscii(bob);
//     //
//     //     const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);
//     //
//     //     var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobBefore = await token.balanceOf.call(bob);
//     //     var totalSupplyBefore = await token.totalSupply.call();
//     //     await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});
//     //
//     //     var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobAfter = await token.balanceOf.call(bob);
//     //     var totalSupplyAfter = await token.totalSupply.call();
//     //
//     //     assert.equal(
//     //         tokenBalanceAliceAfter.valueOf(),
//     //         0,
//     //         'sender should receive no token'
//     //     )
//     //     assert.equal(
//     //         tokenBalanceBobAfter.valueOf(),
//     //         expectedTokenMinted,
//     //         'recipient should have gained token'
//     //     )
//     //     assert.equal(
//     //         totalSupplyAfter.valueOf(),
//     //         expectedTokenMinted,
//     //         'total supply should increase after minting'
//     //     )
//     // })
//     //
//     //
//     // it("should emit Mint event when minting to oneself", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //
//     //     await token.mint.sendTransaction({from: alice});
//     //
//     //     // Check Mint event
//     //     const LogTokenMinted = await token.Mint();
//     //     const logMint = await new Promise(function(resolve, reject) {
//     //         LogTokenMinted.watch(function(error, log){ resolve(log);});
//     //     });
//     //
//     //     const logMintToAddress = logMint.args.to
//     //     const logMintAmount = logMint.args.amount.toNumber()
//     //
//     //     const expectedMintResult = {accountAddress: alice, amount: expectedTokenMinted};
//     //
//     //     assert.equal(
//     //         expectedMintResult.accountAddress,
//     //         logMintToAddress,
//     //         'minting should emit a correct Mint event: destination address'
//     //     )
//     //     assert.equal(
//     //         expectedMintResult.amount,
//     //         logMintAmount,
//     //         'minting should emit a correct Mint event: amount'
//     //     )
//     // })
//     //
//     //
//     // it("should emit Transfer event when minting to oneself", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //
//     //     await token.mint.sendTransaction({from: alice});
//     //
//     //     // Check Transfer event
//     //     const LogTokenTransferred = await token.Transfer();
//     //     const logTransfer = await new Promise(function(resolve, reject) {
//     //         LogTokenTransferred.watch(function(error, log){ resolve(log);});
//     //     });
//     //
//     //     const logTransferFromAddress = logTransfer.args.from
//     //     const logTransferToAddress = logTransfer.args.to
//     //     const logTransferAmount = logTransfer.args.value.toNumber()
//     //
//     //     const expectedTransferResult = {from: 0x0, to: alice, value: expectedTokenMinted};
//     //
//     //     assert.equal(
//     //         expectedTransferResult.from,
//     //         logTransferFromAddress,
//     //         'minting should emit a correct Transfer event: from address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.to,
//     //         logTransferToAddress,
//     //         'minting should emit a correct Transfer event: to address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.value,
//     //         logTransferAmount,
//     //         'minting should emit a correct Transfer event: amount'
//     //     )
//     // })
//     //
//     //
//     // it("should emit Mint event when minting to third party", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //
//     //     var stringAddress = web3.toAscii(bob);
//     //     const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);
//     //     await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});
//     //
//     //     // Check Mint event
//     //     const LogTokenMinted = await token.Mint();
//     //     const logMint = await new Promise(function(resolve, reject) {
//     //         LogTokenMinted.watch(function(error, log){ resolve(log);});
//     //     });
//     //
//     //     const logMintToAddress = logMint.args.to
//     //     const logMintAmount = logMint.args.amount.toNumber()
//     //
//     //     const expectedMintResult = {accountAddress: bob, amount: expectedTokenMinted};
//     //
//     //     assert.equal(
//     //         expectedMintResult.accountAddress,
//     //         logMintToAddress,
//     //         'minting should emit a correct Mint event: destination address'
//     //     )
//     //     assert.equal(
//     //         expectedMintResult.amount,
//     //         logMintAmount,
//     //         'minting should emit a correct Mint event: amount'
//     //     )
//     // })
//     //
//     // it("should emit Transfer event when minting to oneself", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //
//     //     var stringAddress = web3.toAscii(bob);
//     //     const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);
//     //     await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});
//     //
//     //     // Check Transfer event
//     //     const LogTokenTransferred = await token.Transfer();
//     //     const logTransfer = await new Promise(function(resolve, reject) {
//     //         LogTokenTransferred.watch(function(error, log){ resolve(log);});
//     //     });
//     //
//     //     const logTransferFromAddress = logTransfer.args.from
//     //     const logTransferToAddress = logTransfer.args.to
//     //     const logTransferAmount = logTransfer.args.value.toNumber()
//     //
//     //     const expectedTransferResult = {from: 0x0, to: bob, value: expectedTokenMinted};
//     //
//     //     assert.equal(
//     //         expectedTransferResult.from,
//     //         logTransferFromAddress,
//     //         'minting should emit a correct Transfer event: from address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.to,
//     //         logTransferToAddress,
//     //         'minting should emit a correct Transfer event: to address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.value,
//     //         logTransferAmount,
//     //         'minting should emit a correct Transfer event: amount'
//     //     )
//     // })
//     //
//     // it("should be transferrable", async() => {
//     //     var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
//     //     const amountToTransfer = 500;
//     //
//     //     await token.mint.sendTransaction({from: alice});
//     //
//     //     var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobBefore = await token.balanceOf.call(bob);
//     //     var totalSupplyBefore = await token.totalSupply.call();
//     //
//     //     await token.transfer.sendTransaction(bob, amountToTransfer, {from: alice});
//     //
//     //     var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
//     //     var tokenBalanceBobAfter = await token.balanceOf.call(bob);
//     //     var totalSupplyAfter = await token.totalSupply.call();
//     //
//     //
//     //
//     //     // Check Transfer event
//     //     const LogTokenTransferred = await token.Transfer();
//     //     const logTransfer = await new Promise(function(resolve, reject) {
//     //         LogTokenTransferred.watch(function(error, log){ resolve(log);});
//     //     });
//     //
//     //     const logTransferFromAddress = logTransfer.args.from
//     //     const logTransferToAddress = logTransfer.args.to
//     //     const logTransferAmount = logTransfer.args.value.toNumber()
//     //
//     //     const expectedTransferResult = {from: alice, to: bob, value: 500};
//     //
//     //     assert.equal(
//     //         tokenBalanceAliceBefore.valueOf(),
//     //         expectedTokenMinted.valueOf(),
//     //         'sender should have some token after minting'
//     //     )
//     //
//     //     assert.equal(
//     //         tokenBalanceBobBefore.valueOf(),
//     //         0,
//     //         'recipient should have no token before receiving transfer'
//     //     )
//     //
//     //     assert.equal(
//     //         tokenBalanceAliceAfter.valueOf(),
//     //         expectedTokenMinted - amountToTransfer,
//     //         'sender should lose token after transfer'
//     //     )
//     //
//     //     assert.equal(
//     //         tokenBalanceBobAfter.valueOf(),
//     //         amountToTransfer,
//     //         'recipient gain the difference in token'
//     //     )
//     //
//     //     assert.equal(
//     //         totalSupplyBefore.valueOf(),
//     //         totalSupplyAfter.valueOf(),
//     //         'total supply should be unchanged'
//     //     )
//     //
//     //     assert.equal(
//     //         expectedTransferResult.from,
//     //         logTransferFromAddress,
//     //         'transferring should emit a correct Transfer event: from address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.to,
//     //         logTransferToAddress,
//     //         'transferring should emit a correct Transfer event: to address'
//     //     )
//     //     assert.equal(
//     //         expectedTransferResult.value,
//     //         logTransferAmount,
//     //         'transferring should emit a correct Transfer event: amount'
//     //     )
//     // })
//
//
// });
