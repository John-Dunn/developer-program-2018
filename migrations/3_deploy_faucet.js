var GenericERC721TokenA = artifacts.require("./GenericERC721TokenA.sol");
var GenericERC721TokenB = artifacts.require("./GenericERC721TokenB.sol");
var GenericERC20TokenA = artifacts.require("./GenericERC20TokenA.sol");
var GenericERC20TokenB = artifacts.require("./GenericERC20TokenB.sol");

module.exports = function(deployer) {
  deployer.deploy(GenericERC721TokenA);
  deployer.deploy(GenericERC721TokenB);
  deployer.deploy(GenericERC20TokenA);
  deployer.deploy(GenericERC20TokenB);
};
