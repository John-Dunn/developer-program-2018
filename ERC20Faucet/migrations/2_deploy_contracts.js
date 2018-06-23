var GenericERC20Token = artifacts.require("./GenericERC20Token.sol");

module.exports = function(deployer) {
  deployer.deploy(GenericERC20Token);
};
