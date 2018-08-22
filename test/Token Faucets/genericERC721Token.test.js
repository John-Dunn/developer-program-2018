var GenericERC721Token = artifacts.require('GenericERC721TokenA')
const web3Abi = require('web3-eth-abi');

// Truffle tests cannot handle overloaded functions at the moment, using the ABI of the
// function to call it
const overloadedMintAbi = {
      "constant": false,
      "inputs": [
        {
          "name": "_recipient",
          "type": "address"
        }
      ],
      "name": "mint",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
};

contract('GenericERC721Token', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    var token;

    beforeEach(function() {
       return GenericERC721Token.new()
       .then(function(instance) {
          token = instance;
       });
    });

    it("should have no supply initially", async() => {
        let tokenBalanceDeployer = await token.balanceOf.call(deployer);
        let tokenBalanceAlice = await token.balanceOf.call(alice);
        let tokenBalanceBob = await token.balanceOf.call(deployer);
        let totalSupply = await token.totalSupply.call();

        assert.equal(tokenBalanceDeployer.valueOf(), 0, 'balance of deployer should be 0');
        assert.equal(tokenBalanceAlice.valueOf(), 0, 'balance of alice should be 0');
        assert.equal(tokenBalanceBob.valueOf(), 0, 'balance of bob should be 0');
        assert.equal(totalSupply.valueOf(), 0, 'total supply should be 0');
    })

    it("should mint token to sender if called without arguments", async() => {

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var tokenBalanceBobBefore = await token.balanceOf.call(bob);
        var totalSupplyBefore = await token.totalSupply.call();

        await token.mint.sendTransaction({from: alice});

        var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
        var tokenBalanceBobAfter = await token.balanceOf.call(bob);
        var totalSupplyAfter = await token.totalSupply.call();

        assert.equal(
            totalSupplyBefore.valueOf(),
            0,
            'total supply should be 0 in the beginning'
        )
        assert.equal(
            tokenBalanceAliceBefore.valueOf(),
            0,
            'sender should have no token in the beginning'
        )
        assert.equal(
            tokenBalanceBobBefore.valueOf(),
            0,
            'third party should have no token in the beginning'
        )
        assert.equal(
            tokenBalanceAliceAfter.valueOf(),
            1,
            'sender should have received token'
        )
        assert.equal(
            tokenBalanceBobAfter.valueOf(),
            0,
            'third party balance should be unchanged'
        )
        assert.equal(
            totalSupplyAfter.valueOf(),
            1,
            'total supply should increase after minting'
        )
    })


    it("should mint to given address if provided", async() => {
        var stringAddress = web3.toAscii(bob);

        const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var tokenBalanceBobBefore = await token.balanceOf.call(bob);
        var totalSupplyBefore = await token.totalSupply.call();
        await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData, gas: 200000});

        var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
        var tokenBalanceBobAfter = await token.balanceOf.call(bob);
        var totalSupplyAfter = await token.totalSupply.call();

        assert.equal(
            tokenBalanceAliceAfter.valueOf(),
            0,
            'sender should receive no token'
        )
        assert.equal(
            tokenBalanceBobAfter.valueOf(),
            1,
            'recipient should have gained token'
        )
        assert.equal(
            totalSupplyAfter.valueOf(),
            1,
            'total supply should increase after minting'
        )
    })


    it("should emit Transfer event when minting", async() => {
        await token.mint.sendTransaction({from: alice});

        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args._from
        const logTransferToAddress = logTransfer.args._to
        const logTokenId = logTransfer.args._tokenId.toNumber()

        const expectedTransferResult = {from: 0x0, to: alice, tokenId: 0};

        assert.equal(
            expectedTransferResult.from,
            logTransferFromAddress,
            'minting should emit a correct Transfer event: from address'
        )
        assert.equal(
            expectedTransferResult.to,
            logTransferToAddress,
            'minting should emit a correct Transfer event: to address'
        )
        assert.equal(
            expectedTransferResult.tokenId,
            logTokenId,
            'minting should emit a correct Transfer event: amount'
        )
    })


    it("should be transferrable", async() => {
        await token.mint.sendTransaction({from: alice});

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var tokenBalanceBobBefore = await token.balanceOf.call(bob);
        var totalSupplyBefore = await token.totalSupply.call();

        await token.transferFrom.sendTransaction(alice, bob, 0, {from: alice});

        var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
        var tokenBalanceBobAfter = await token.balanceOf.call(bob);
        var totalSupplyAfter = await token.totalSupply.call();



        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args._from
        const logTransferToAddress = logTransfer.args._to
        const logTokenId = logTransfer.args._tokenId.toNumber()

        const expectedTransferResult = {from: alice, to: bob, tokenId: 0};

        assert.equal(
            tokenBalanceAliceBefore.valueOf(),
            1,
            'sender should have some token after minting'
        )

        assert.equal(
            tokenBalanceBobBefore.valueOf(),
            0,
            'recipient should have no token before receiving transfer'
        )

        assert.equal(
            tokenBalanceAliceAfter.valueOf(),
            0,
            'sender should lose token after transfer'
        )

        assert.equal(
            tokenBalanceBobAfter.valueOf(),
            1,
            'recipient gain the difference in token'
        )

        assert.equal(
            totalSupplyBefore.valueOf(),
            totalSupplyAfter.valueOf(),
            'total supply should be unchanged'
        )

        assert.equal(
            expectedTransferResult.from,
            logTransferFromAddress,
            'transferring should emit a correct Transfer event: from address'
        )
        assert.equal(
            expectedTransferResult.to,
            logTransferToAddress,
            'transferring should emit a correct Transfer event: to address'
        )
        assert.equal(
            expectedTransferResult.tokenId,
            logTokenId,
            'transferring should emit a correct Transfer event: amount'
        )
    })

    it("should be approvable and transferrable", async() => {
        await token.mint.sendTransaction({from: alice});
        await token.approve.sendTransaction(bob, 0, {from: alice});

        // Check Approved event
        const LogTokenApproved = await token.Approval();
        const logApproved = await new Promise(function(resolve, reject) {
            LogTokenApproved.watch(function(error, log){ resolve(log);});
        });

        const logApprovalFromAddress = logApproved.args._from
        const logApprovalToAddress = logApproved.args._to
        const logTokenId = logApproved.args._tokenId.toNumber()

        const expectedResult = {from: alice, to: bob, tokenId: 0};

        assert.equal(
            logTokenId.from,
            logApprovalFromAddress,
            'approving should emit a correct Approval event: from address'
        )
        assert.equal(
            logTokenId.to,
            logApprovalToAddress,
            'approving should emit a correct Approval event: to address'
        )
        assert.equal(
            expectedResult.tokenId,
            logTokenId,
            'approving should emit a correct Approval event: amount'
        )



        await token.transferFrom.sendTransaction(alice, bob, 0, {from: bob});
        var ownerOfToken = await token.ownerOf.call(0);

        assert.equal(
            ownerOfToken,
            bob,
            'transferring after approvel should give bob the token'
        )


    })


});
