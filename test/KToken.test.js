const KToken = artifacts.require("./KToken.sol");
const BigNumber = require("bignumber.js");
contract("KToken", (accounts) => {
  let instance;
  const tokens = BigNumber(10).pow(18).multipliedBy(1000);
  const owner = accounts[0];
  const user = accounts[1];
  before(async () => {
    instance = await KToken.deployed();
  });

  describe("Staking", () => {
    beforeEach(async () => {
      instance = await KToken.new(owner, tokens.toString(10));
    });

    it("createStake creats a stake.", async () => {
      await instance.transfer(user, 10, { from: owner });
      await instance.createStake(4, { from: user });
      assert.equal(await instance.balanceOf(user), 6);
      assert.equal(await instance.stakeOf(user), 4);
      assert.equal(await instance.totalStakes(), 4);
      assert.equal(await instance.totalSupply(), tokens.minus(4).toString(10));
      assert.equal((await instance.isStakeholder(user))[0], true);
    });

    it("removeStake removes a stake", async () => {
      await instance.transfer(user, 10, { from: owner });
      await instance.createStake(4, { from: user });
      await instance.removeStake(1, { from: user });

      assert.equal(await instance.balanceOf(user), 7);
      assert.equal(await instance.stakeOf(user), 3);
      assert.equal(await instance.totalSupply(), tokens.minus(3).toString(10));
      assert.equal(await instance.totalStakes(), 3);
    });

    it("rewards are distributed", async () => {
      await instance.transfer(user, 100, { from: owner });
      await instance.createStake(100, { from: user });
      await instance.distributeRewards({ from: owner });

      assert.equal(await instance.rewardOf(user), 1);
      assert.equal(await instance.totalRewards(), 1);
    });

    it("rewards can withdraw", async () => {
      await instance.transfer(user, 100, { from: owner });
      await instance.createStake(100, { from: user });
      await instance.distributeRewards({ from: owner });
      await instance.withdrawReward({ from: user });

      const initialSupply = tokens;
      const existingStakes = 100;
      const withdrawn = 1;
      assert.equal(await instance.balanceOf(user), 1);
      assert.equal(await instance.stakeOf(user), 100);
      assert.equal(await instance.rewardOf(user), 0);
      assert.equal(
        await instance.totalSupply(),
        initialSupply.minus(existingStakes).plus(withdrawn).toString(10)
      );
      assert.equal(await instance.totalStakes(), 100);
      assert.equal(await instance.totalRewards(), 0);
    });
  });
});
