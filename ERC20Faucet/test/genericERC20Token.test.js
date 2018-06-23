var GenericERC20Token = artifacts.require('GenericERC20Token')

contract('GenericERC20Token', function(accounts) {

    const deployer = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const amountToExchange = web3.toWei(0.5, "ether")

    it("nobody should have tokens immediately after deployment", async() => {
        const token = await GenericERC20Token.deployed()
        let tokenBalanceDeployer = await token.balanceOf.call(deployer);
        let tokenBalanceAlice = await token.balanceOf.call(alice);
        let tokenBalanceBob = await token.balanceOf.call(deployer);
        let totalSupply = await token.totalSupply.call();

        assert.equal(tokenBalanceDeployer.valueOf(), 0, 'balance of deployer should be 0');
        assert.equal(tokenBalanceAlice.valueOf(), 0, 'balance of alice should be 0');
        assert.equal(tokenBalanceBob.valueOf(), 0, 'balance of bob should be 0');
        assert.equal(totalSupply.valueOf(), 0, 'total supply should be 0');
    })


    it("token contract should have no ether after deployment", async() => {
        const token = await GenericERC20Token.deployed()
        var ethBalanceContract = await web3.eth.getBalance(token.address).toNumber()

        assert.equal(ethBalanceContract, 0, 'contract should have no ether');
    })


    it("should receive ETH from sender and mint token", async() => {
        const token = await GenericERC20Token.deployed()

        var ethBalanceContractBefore = await web3.eth.getBalance(token.address).toNumber()
        var ethBalanceAliceBefore = await web3.eth.getBalance(alice).toNumber()

        var tokenBalanceAliceBefore = await token.balanceOf.call(alice);
        var totalSupplyBefore = await token.totalSupply.call();

        await token.mint.sendTransaction({from: alice, value: amountToExchange});

        var ethBalanceContractAfter = await web3.eth.getBalance(token.address).toNumber()
        var ethBalanceAliceAfter = await web3.eth.getBalance(alice).toNumber()

        var tokenBalanceAliceAfter = await token.balanceOf.call(alice);
        var totalSupplyAfter = await token.totalSupply.call();

        assert.equal(
            totalSupplyBefore.valueOf(),
            0,
            'total supply should be 0 in the beginning'
        )
        assert.equal(
            tokenBalanceAliceBefore.valueOf(),
            0,
            'sender should have no tokens at the beginning'
        )
        assert.isAbove(
            ethBalanceAliceBefore - amountToExchange,
            ethBalanceAliceAfter,
            'balance of sender should decrease by sent amount (plus gas)'
        )
        assert.equal(
            ethBalanceContractBefore,
            ethBalanceContractAfter - amountToExchange,
            'balance of contract should increase by sent amount'
        )
        assert.equal(
            tokenBalanceAliceAfter.valueOf(),
            amountToExchange,
            'sender should have equivalent amount of tokens to spent ether'
        )
        assert.equal(
            totalSupplyAfter.valueOf(),
            amountToExchange,
            'total supply should increase after minting'
        )
    })


    it("should emit Mint event", async() => {
        const token = await GenericERC20Token.deployed()

        await token.mint.sendTransaction({from: alice, value: amountToExchange});

        // Check Mint event
        const LogTokenMinted = await token.Mint();
        const logMint = await new Promise(function(resolve, reject) {
            LogTokenMinted.watch(function(error, log){ resolve(log);});
        });

        const logMintToAddress = logMint.args.to
        const logMintAmount = logMint.args.amount.toNumber()

        const expectedMintResult = {accountAddress: alice, amount: amountToExchange};

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

    it("should emit Transfer event", async() => {
        const token = await GenericERC20Token.deployed()

        await token.mint.sendTransaction({from: alice, value: amountToExchange});

        // Check Transfer event
        const LogTokenTransferred = await token.Transfer();
        const logTransfer = await new Promise(function(resolve, reject) {
            LogTokenTransferred.watch(function(error, log){ resolve(log);});
        });

        const logTransferFromAddress = logTransfer.args.from
        const logTransferToAddress = logTransfer.args.to
        const logTransferAmount = logTransfer.args.value.toNumber()

        const expectedTransferResult = {from: 0x0, to: alice, value: amountToExchange};

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
});
