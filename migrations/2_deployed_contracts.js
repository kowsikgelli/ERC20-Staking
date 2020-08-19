const BigNumber = require("bignumber.js");
const KToken = artifacts.require("KToken.sol");
module.exports = function (deployer, network, accounts) {
  deployer.deploy(
    KToken,
    accounts[1],
    new BigNumber(10).pow(18).multipliedBy(1000).toString(10)
  );
};
