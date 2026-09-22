import { expect } from 'chai';
import { ethers } from 'hardhat';
import { type SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  type ERC20Mock,
  type TornadoVault,
  type MockGovernanceForStaking,
  type TornadoStakingRewards,
  type TornadoStakingRewardsUpgrade,
  type AdminUpgradeableProxy,
  type FeeSplitProposal,
} from '../typechain-types';

describe('Tornado Cash Staking Fee Split Upgrade (70/30)', () => {
  let deployer: SignerWithAddress;
  let relayerRegistrySigner: SignerWithAddress;
  let staker1: SignerWithAddress;
  let staker2: SignerWithAddress;
  let attacker: SignerWithAddress;

  let torn: ERC20Mock;
  let userVault: TornadoVault;
  let mockGov: MockGovernanceForStaking;
  let initialLogic: TornadoStakingRewards;
  let upgradedLogic: TornadoStakingRewardsUpgrade;
  let proxy: AdminUpgradeableProxy;
  let staking: TornadoStakingRewardsUpgrade;
  let proposal: FeeSplitProposal;

  const RATIO_CONSTANT = BigInt('10000000000000000000000000'); // 1e25
  const STAKER1_LOCKED = ethers.parseEther('10000');
  const STAKER2_LOCKED = ethers.parseEther('30000');
  const TOTAL_VAULT_BALANCE = ethers.parseEther('40000');
  const INITIAL_STAKING_BALANCE = ethers.parseEther('50000');

  beforeEach(async () => {
    [deployer, relayerRegistrySigner, staker1, staker2, attacker] =
      await ethers.getSigners();

    // 1. Deploy TORN Token Mock (no constructor arguments)
    const ERC20MockFactory = await ethers.getContractFactory('ERC20Mock');
    torn = await ERC20MockFactory.deploy();
    await torn.waitForDeployment();

    // 2. Deploy Mock Governance
    const MockGovFactory = await ethers.getContractFactory('MockGovernanceForStaking');
    mockGov = await MockGovFactory.deploy();
    await mockGov.waitForDeployment();

    // 3. Deploy TornadoVault
    const VaultFactory = await ethers.getContractFactory('TornadoVault');
    userVault = await VaultFactory.deploy(await torn.getAddress(), await mockGov.getAddress());
    await userVault.waitForDeployment();

    await mockGov.setUserVault(await userVault.getAddress());

    // Setup staker balances in mock governance and fund userVault
    await mockGov.setLockedBalance(staker1.address, STAKER1_LOCKED);
    await mockGov.setLockedBalance(staker2.address, STAKER2_LOCKED);
    await torn.mint(await userVault.getAddress(), TOTAL_VAULT_BALANCE);
    // Mint remaining supply to deployer to match 10M TORN (1e25) mainnet initial supply
    await torn.mint(deployer.address, RATIO_CONSTANT - TOTAL_VAULT_BALANCE);

    // 4. Deploy initial TornadoStakingRewards implementation
    const InitialLogicFactory = await ethers.getContractFactory('TornadoStakingRewards');
    initialLogic = await InitialLogicFactory.deploy(
      await mockGov.getAddress(),
      await torn.getAddress(),
      relayerRegistrySigner.address
    );
    await initialLogic.waitForDeployment();

    // Verify initial ratioConstant
    const initialRatioConstant = await initialLogic.ratioConstant();

    // 5. Deploy AdminUpgradeableProxy pointing to initial logic (Admin is mockGov)
    const ProxyFactory = await ethers.getContractFactory(
      'contracts/Governance/AdminUpgradeableProxy.sol:AdminUpgradeableProxy'
    );
    proxy = await ProxyFactory.deploy(
      await initialLogic.getAddress(),
      await mockGov.getAddress(),
      '0x'
    );
    await proxy.waitForDeployment();

    // Fund the staking proxy with initial TORN
    await torn.mint(await proxy.getAddress(), INITIAL_STAKING_BALANCE);

    // Initial staking contract instance
    const initialStaking = (await ethers.getContractAt(
      'TornadoStakingRewards',
      await proxy.getAddress()
    )) as unknown as TornadoStakingRewards;

    // 6. Simulate pre-upgrade protocol fee notification
    const preUpgradeFee = ethers.parseEther('100');
    await initialStaking.connect(relayerRegistrySigner).addBurnRewards(preUpgradeFee);

    // Check that rewards accrued before upgrade
    const staker1PreReward = await initialStaking.checkReward(staker1.address);
    expect(staker1PreReward).to.be.gt(0);

    // 7. Deploy new implementation (TornadoStakingRewardsUpgrade) using exact initial ratioConstant
    const UpgradedLogicFactory = await ethers.getContractFactory('TornadoStakingRewardsUpgrade');
    upgradedLogic = await UpgradedLogicFactory.deploy(
      await mockGov.getAddress(),
      await torn.getAddress(),
      relayerRegistrySigner.address,
      initialRatioConstant
    );
    await upgradedLogic.waitForDeployment();

    // 8. Deploy Proposal Contract
    const ProposalFactory = await ethers.getContractFactory('FeeSplitProposal');
    proposal = await ProposalFactory.deploy(
      await proxy.getAddress(),
      await upgradedLogic.getAddress()
    );
    await proposal.waitForDeployment();

    // 9. Execute Upgrade via Governance delegatecall (simulating real on-chain DAO proposal execution)
    await mockGov.executeProposal(await proposal.getAddress());

    // Connect to proxy using the upgraded ABI
    staking = (await ethers.getContractAt(
      'TornadoStakingRewardsUpgrade',
      await proxy.getAddress()
    )) as unknown as TornadoStakingRewardsUpgrade;
  });

  describe('Upgrade & Configuration Validation', () => {
    it('should have upgraded the proxy via Governance proposal delegatecall', async () => {
      // Impersonate mockGov (admin) to call implementation() on proxy
      const mockGovSigner = await ethers.getImpersonatedSigner(await mockGov.getAddress());
      await deployer.sendTransaction({
        to: await mockGov.getAddress(),
        value: ethers.parseEther('1'),
      });

      const impl = await proxy.connect(mockGovSigner).implementation.staticCall();
      expect(impl.toLowerCase()).to.equal((await upgradedLogic.getAddress()).toLowerCase());
    });

    it('should preserve ratioConstant and immutable addresses', async () => {
      expect(await staking.ratioConstant()).to.equal(RATIO_CONSTANT);
      expect(await staking.Governance()).to.equal(await mockGov.getAddress());
      expect(await staking.torn()).to.equal(await torn.getAddress());
      expect(await staking.relayerRegistry()).to.equal(relayerRegistrySigner.address);
    });

    it('should reject invalid constructor arguments', async () => {
      const Factory = await ethers.getContractFactory('TornadoStakingRewardsUpgrade');
      const zeroAddr = ethers.ZeroAddress;

      await expect(
        Factory.deploy(zeroAddr, await torn.getAddress(), relayerRegistrySigner.address, RATIO_CONSTANT)
      ).to.be.revertedWith('TornadoStakingRewards: zero governance');

      await expect(
        Factory.deploy(await mockGov.getAddress(), zeroAddr, relayerRegistrySigner.address, RATIO_CONSTANT)
      ).to.be.revertedWith('TornadoStakingRewards: zero torn');

      await expect(
        Factory.deploy(await mockGov.getAddress(), await torn.getAddress(), zeroAddr, RATIO_CONSTANT)
      ).to.be.revertedWith('TornadoStakingRewards: zero relayer registry');

      await expect(
        Factory.deploy(await mockGov.getAddress(), await torn.getAddress(), relayerRegistrySigner.address, 0)
      ).to.be.revertedWith('TornadoStakingRewards: zero ratio constant');
    });

    it('should validate FeeSplitProposal deployment parameters', async () => {
      const ProposalFactory = await ethers.getContractFactory('FeeSplitProposal');
      await expect(
        ProposalFactory.deploy(ethers.ZeroAddress, await upgradedLogic.getAddress())
      ).to.be.revertedWith('FeeSplitProposal: zero staking proxy');

      await expect(
        ProposalFactory.deploy(await proxy.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith('FeeSplitProposal: zero implementation');
    });
  });

  describe('Historical Reward Continuity', () => {
    it('should preserve claimable reward amounts accrued before the upgrade', async () => {
      const staker1Reward = await staking.checkReward(staker1.address);
      const staker2Reward = await staking.checkReward(staker2.address);

      // Pre-upgrade fee was 100 TORN across 40,000 TORN stakers
      // Staker 1 has 10,000 / 40,000 = 25% -> 25 TORN
      // Staker 2 has 30,000 / 40,000 = 75% -> 75 TORN
      expect(staker1Reward).to.equal(ethers.parseEther('25'));
      expect(staker2Reward).to.equal(ethers.parseEther('75'));
    });

    it('should allow staker to claim pre-upgrade rewards without any 30% deduction', async () => {
      const initialBalance = await torn.balanceOf(staker1.address);
      await staking.connect(staker1).getReward();
      const finalBalance = await torn.balanceOf(staker1.address);

      // Staker 1 receives full 25 TORN without deduction
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther('25'));
      expect(await staking.checkReward(staker1.address)).to.equal(0);
    });
  });

  describe('70/30 Fee Split & Direct Governance Transfer', () => {
    it('should transfer 30% directly to Governance and allocate 70% to rewards on relayer fee', async () => {
      const feeAmount = ethers.parseEther('200');
      const expectedGovernanceAmount = ethers.parseEther('60'); // 30%
      const expectedRewardAmount = ethers.parseEther('140'); // 70%

      const stakingBalanceBefore = await torn.balanceOf(await proxy.getAddress());
      const govBalanceBefore = await torn.balanceOf(await mockGov.getAddress());
      const accRewardBefore = await staking.accumulatedRewardPerTorn();

      const tx = await staking.connect(relayerRegistrySigner).addBurnRewards(feeAmount);

      // 1. Verify event emitted with exact split
      await expect(tx)
        .to.emit(staking, 'ProtocolFeeAllocated')
        .withArgs(feeAmount, expectedRewardAmount, expectedGovernanceAmount);

      // 2. Verify Governance contract received exactly 30%
      const govBalanceAfter = await torn.balanceOf(await mockGov.getAddress());
      expect(govBalanceAfter - govBalanceBefore).to.equal(expectedGovernanceAmount);

      // 3. Verify Staking Proxy balance decreased by exactly 30%
      const stakingBalanceAfter = await torn.balanceOf(await proxy.getAddress());
      expect(stakingBalanceBefore - stakingBalanceAfter).to.equal(expectedGovernanceAmount);

      // 4. Verify accumulatedRewardPerTorn increased by the 70% fraction
      const accRewardAfter = await staking.accumulatedRewardPerTorn();
      const expectedAccDelta = (expectedRewardAmount * RATIO_CONSTANT) / TOTAL_VAULT_BALANCE;
      expect(accRewardAfter - accRewardBefore).to.equal(expectedAccDelta);
    });

    it('should distribute rewards correctly to stakers from post-upgrade fees', async () => {
      // Staker 1 claims previous rewards to reset to 0
      await staking.connect(staker1).getReward();

      // Relayer incurs 100 TORN fee:
      // 30 TORN -> Governance
      // 70 TORN -> Staking rewards
      const fee = ethers.parseEther('100');
      await staking.connect(relayerRegistrySigner).addBurnRewards(fee);

      // Staker 1 (25% share of 70 TORN = 17.5 TORN)
      const staker1Reward = await staking.checkReward(staker1.address);
      expect(staker1Reward).to.equal(ethers.parseEther('17.5'));

      // Staker 1 claims
      const balanceBefore = await torn.balanceOf(staker1.address);
      await staking.connect(staker1).getReward();
      const balanceAfter = await torn.balanceOf(staker1.address);

      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther('17.5'));
    });

    it('should support multiple consecutive fee deductions accurately', async () => {
      const fees = [ethers.parseEther('50'), ethers.parseEther('150'), ethers.parseEther('300')];
      let totalGovExpected = 0n;

      for (const fee of fees) {
        const govAmt = (fee * 30n) / 100n;
        totalGovExpected += govAmt;

        const govBefore = await torn.balanceOf(await mockGov.getAddress());
        await staking.connect(relayerRegistrySigner).addBurnRewards(fee);
        const govAfter = await torn.balanceOf(await mockGov.getAddress());

        expect(govAfter - govBefore).to.equal(govAmt);
      }

      // 50*0.3 + 150*0.3 + 300*0.3 = 15 + 45 + 90 = 150 TORN
      expect(await torn.balanceOf(await mockGov.getAddress())).to.equal(totalGovExpected);
    });
  });

  describe('Precision, Rounding & Base Unit Invariants', () => {
    it('should ensure rewardAmount + governanceAmount == amount always (zero-leak)', async () => {
      // Test odd amounts where division has remainder
      const oddAmounts = [
        1n,
        3n,
        7n,
        10n,
        33n,
        99n,
        101n,
        333333333333333333n,
        ethers.parseEther('0.000000000000000001'),
      ];

      for (const amount of oddAmounts) {
        const tx = await staking.connect(relayerRegistrySigner).addBurnRewards(amount);
        const receipt = await tx.wait();

        // Find ProtocolFeeAllocated event
        const event = receipt?.logs
          .map((log) => {
            try {
              return staking.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((parsed) => parsed?.name === 'ProtocolFeeAllocated');

        expect(event).to.not.be.null;
        const feeAmount = event?.args.feeAmount;
        const rewardAmount = event?.args.rewardAmount;
        const governanceAmount = event?.args.governanceAmount;

        expect(rewardAmount + governanceAmount).to.equal(feeAmount);
        expect(governanceAmount).to.equal((amount * 30n) / 100n);
        expect(rewardAmount).to.equal(amount - governanceAmount);
      }
    });

    it('should handle zero fee without revert or transfer', async () => {
      const govBalanceBefore = await torn.balanceOf(await mockGov.getAddress());
      const tx = await staking.connect(relayerRegistrySigner).addBurnRewards(0);

      await expect(tx)
        .to.emit(staking, 'ProtocolFeeAllocated')
        .withArgs(0, 0, 0);

      const govBalanceAfter = await torn.balanceOf(await mockGov.getAddress());
      expect(govBalanceAfter).to.equal(govBalanceBefore);
    });
  });

  describe('Access Control & Call Authorization', () => {
    it('should revert when addBurnRewards is called by unauthorized account', async () => {
      await expect(
        staking.connect(attacker).addBurnRewards(ethers.parseEther('10'))
      ).to.be.revertedWith('unauthorized');

      await expect(
        staking.connect(staker1).addBurnRewards(ethers.parseEther('10'))
      ).to.be.revertedWith('unauthorized');
    });

    it('should credit 100% to rewards without deduction when called by Governance', async () => {
      const govAmount = ethers.parseEther('50');
      const govBalanceBefore = await torn.balanceOf(await mockGov.getAddress());
      const accRewardBefore = await staking.accumulatedRewardPerTorn();

      // Impersonate mockGov to simulate call from address(Governance)
      const mockGovSigner = await ethers.getImpersonatedSigner(await mockGov.getAddress());
      await deployer.sendTransaction({
        to: await mockGov.getAddress(),
        value: ethers.parseEther('1'),
      });

      await staking.connect(mockGovSigner).addBurnRewards(govAmount);

      // Governance balance unchanged (no 30% transferred to itself)
      const govBalanceAfter = await torn.balanceOf(await mockGov.getAddress());
      expect(govBalanceAfter).to.equal(govBalanceBefore);

      // Full 100% added to accumulatedRewardPerTorn
      const accRewardAfter = await staking.accumulatedRewardPerTorn();
      const expectedAccDelta = (govAmount * RATIO_CONSTANT) / TOTAL_VAULT_BALANCE;
      expect(accRewardAfter - accRewardBefore).to.equal(expectedAccDelta);
    });

    it('should restrict updateRewardsOnLockedBalanceChange, setReward, and withdrawTorn to Governance', async () => {
      await expect(
        staking.connect(attacker).updateRewardsOnLockedBalanceChange(staker1.address, 100)
      ).to.be.revertedWith('only governance');

      await expect(
        staking.connect(attacker).setReward(staker1.address, 100)
      ).to.be.revertedWith('only governance');

      await expect(
        staking.connect(attacker).withdrawTorn(100)
      ).to.be.revertedWith('only governance');
    });
  });
});
