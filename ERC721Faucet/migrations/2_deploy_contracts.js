var GenericERC721Token = artifacts.require("./GenericERC721Token.sol");

module.exports = function(deployer) {
  deployer.deploy(GenericERC721Token);
};
