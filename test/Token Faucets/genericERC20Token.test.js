var GenericERC20Token = artifacts.require('GenericERC20TokenA')
const web3Abi = require('web3-eth-abi');

// Truffle tests cannot handle overloaded functions at the moment, using the ABI of the
// function to call it
const overloadedMintAbi = {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
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

contract('GenericERC20Token', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    var token;

    beforeEach(function() {
       return GenericERC20Token.new()
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


    it("should have no ether after deployment", async() => {
        //const token = await GenericERC20Token.deployed()
        var ethBalanceContract = await web3.eth.getBalance(token.address).toNumber()

        assert.equal(ethBalanceContract, 0, 'contract should have no ether');
    })


    it("should mint token to sender if called without arguments", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();

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
            expectedTokenMinted,
            'sender should have received token'
        )
        assert.equal(
            tokenBalanceBobAfter.valueOf(),
            0,
            'third party balance should be unchanged'
        )
        assert.equal(
            totalSupplyAfter.valueOf(),
            expectedTokenMinted,
            'total supply should increase after minting'
        )
    })


    it("should mint to given address if provided", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
        var stringAddress = web3.toAscii(bob);

        const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var tokenBalanceBobBefore = await token.balanceOf.call(bob);
        var totalSupplyBefore = await token.totalSupply.call();
        await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});

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
            expectedTokenMinted,
            'recipient should have gained token'
        )
        assert.equal(
            totalSupplyAfter.valueOf(),
            expectedTokenMinted,
            'total supply should increase after minting'
        )
    })


    it("should emit Mint event when minting to oneself", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();

        await token.mint.sendTransaction({from: alice});

        // Check Mint event
        const LogTokenMinted = await token.Mint();
        const logMint = await new Promise(function(resolve, reject) {
            LogTokenMinted.watch(function(error, log){ resolve(log);});
        });

        const logMintToAddress = logMint.args.to
        const logMintAmount = logMint.args.amount.toNumber()

        const expectedMintResult = {accountAddress: alice, amount: expectedTokenMinted};

        assert.equal(
            expectedMintResult.accountAddress,
            logMintToAddress,
            'minting should emit a correct Mint event: destination address'
        )
        assert.equal(
            expectedMintResult.amount,
            logMintAmount,
            'minting should emit a correct Mint event: amount'
        )
    })


    it("should emit Transfer event when minting to oneself", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();

        await token.mint.sendTransaction({from: alice});

        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args.from
        const logTransferToAddress = logTransfer.args.to
        const logTransferAmount = logTransfer.args.value.toNumber()

        const expectedTransferResult = {from: 0x0, to: alice, value: expectedTokenMinted};

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
            expectedTransferResult.value,
            logTransferAmount,
            'minting should emit a correct Transfer event: amount'
        )
    })


    it("should emit Mint event when minting to third party", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();

        var stringAddress = web3.toAscii(bob);
        const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);
        await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});

        // Check Mint event
        const LogTokenMinted = await token.Mint();
        const logMint = await new Promise(function(resolve, reject) {
            LogTokenMinted.watch(function(error, log){ resolve(log);});
        });

        const logMintToAddress = logMint.args.to
        const logMintAmount = logMint.args.amount.toNumber()

        const expectedMintResult = {accountAddress: bob, amount: expectedTokenMinted};

        assert.equal(
            expectedMintResult.accountAddress,
            logMintToAddress,
            'minting should emit a correct Mint event: destination address'
        )
        assert.equal(
            expectedMintResult.amount,
            logMintAmount,
            'minting should emit a correct Mint event: amount'
        )
    })

    it("should emit Transfer event when minting to oneself", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();

        var stringAddress = web3.toAscii(bob);
        const overloadedMintTxData = web3Abi.encodeFunctionCall(overloadedMintAbi,[bob]);
        await web3.eth.sendTransaction({from: alice, to: token.address, data: overloadedMintTxData});

        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args.from
        const logTransferToAddress = logTransfer.args.to
        const logTransferAmount = logTransfer.args.value.toNumber()

        const expectedTransferResult = {from: 0x0, to: bob, value: expectedTokenMinted};

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
            expectedTransferResult.value,
            logTransferAmount,
            'minting should emit a correct Transfer event: amount'
        )
    })

    it("should be transferrable", async() => {
        var expectedTokenMinted = await token.AMOUNT_TO_MINT.call();
        const amountToTransfer = 500;

        await token.mint.sendTransaction({from: alice});

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var tokenBalanceBobBefore = await token.balanceOf.call(bob);
        var totalSupplyBefore = await token.totalSupply.call();

        await token.transfer.sendTransaction(bob, amountToTransfer, {from: alice});

        var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
        var tokenBalanceBobAfter = await token.balanceOf.call(bob);
        var totalSupplyAfter = await token.totalSupply.call();



        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args.from
        const logTransferToAddress = logTransfer.args.to
        const logTransferAmount = logTransfer.args.value.toNumber()

        const expectedTransferResult = {from: alice, to: bob, value: 500};

        assert.equal(
            tokenBalanceAliceBefore.valueOf(),
            expectedTokenMinted.valueOf(),
            'sender should have some token after minting'
        )

        assert.equal(
            tokenBalanceBobBefore.valueOf(),
            0,
            'recipient should have no token before receiving transfer'
        )

        assert.equal(
            tokenBalanceAliceAfter.valueOf(),
            expectedTokenMinted - amountToTransfer,
            'sender should lose token after transfer'
        )

        assert.equal(
            tokenBalanceBobAfter.valueOf(),
            amountToTransfer,
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
            expectedTransferResult.value,
            logTransferAmount,
            'transferring should emit a correct Transfer event: amount'
        )
    })


});
