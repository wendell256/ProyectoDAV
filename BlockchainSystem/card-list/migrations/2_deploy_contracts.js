var CardList = artifacts.require("./CardList.sol");

module.exports = function(deployer) {
  deployer.deploy(CardList);
};