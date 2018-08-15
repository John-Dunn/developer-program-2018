var GenericERC721TokenA = artifacts.require("./GenericERC721TokenA.sol");
var GenericERC721TokenB = artifacts.require("./GenericERC721TokenB.sol");

module.exports = function(deployer) {
  deployer.deploy(GenericERC721TokenA);
  deployer.deploy(GenericERC721TokenB);
};
