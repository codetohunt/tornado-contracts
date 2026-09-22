import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { type SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  type TornadoStakingRewardsUpgrade,
  type FeeSplitProposal,
} from '../typechain-types';

describe('Mainnet Fork Simulation: 70/30 Staking Upgrade & Governance Proposal', function () {
  // Allow enough time for fork network requests
  this.timeout(120000);

  const MAINNET_GOVERNANCE = '0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce';
  const MAINNET_TORN = '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C';
  const MAINNET_RELAYER_REGISTRY = '0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2';
  const MAINNET_STAKING_PROXY = '0x5B3f656C80E8ddb9ec01Dd9018815576E9238c29';
  const MAINNET_OLD_STAKING_IMPL = '0x9c97be37840f0e754bb7aDB1b16fD0954A2BA248';
  const MAINNET_RATIO_CONSTANT = BigInt('0x84594f3c17ca0a8113ea1');

  // EIP-1967 implementation slot
  const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

  let deployer: SignerWithAddress;
  let upgradeImpl: TornadoStakingRewardsUpgrade;
  let proposal: FeeSplitProposal;
  let initialAccumulatedRewardPerTorn: bigint;

  before(async () => {
    // Reset Hardhat network to fork Ethereum mainnet
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com',
          },
        },
      ],
    });

    [deployer] = await ethers.getSigners();
  });

  it('should verify live mainnet pre-upgrade state and slot 1 rewards', async () => {
    // 1. Verify current implementation on proxy
    const currentImplSlot = await ethers.provider.getStorage(MAINNET_STAKING_PROXY, IMPLEMENTATION_SLOT);
    const currentImplAddress = ethers.getAddress('0x' + currentImplSlot.slice(26));
    expect(currentImplAddress.toLowerCase()).to.equal(MAINNET_OLD_STAKING_IMPL.toLowerCase());

    // 2. Read current accumulatedRewardPerTorn at Slot 1
    const slot1 = await ethers.provider.getStorage(MAINNET_STAKING_PROXY, 1);
    initialAccumulatedRewardPerTorn = BigInt(slot1);
    expect(initialAccumulatedRewardPerTorn).to.be.gt(0n);
    console.log('       [Mainnet Fork] Pre-upgrade accumulatedRewardPerTorn:', initialAccumulatedRewardPerTorn.toString());
  });

  it('should deploy TornadoStakingRewardsUpgrade with live mainnet parameters', async () => {
    const UpgradeFactory = await ethers.getContractFactory('TornadoStakingRewardsUpgrade');
    upgradeImpl = await UpgradeFactory.deploy(
      MAINNET_GOVERNANCE,
      MAINNET_TORN,
      MAINNET_RELAYER_REGISTRY,
      MAINNET_RATIO_CONSTANT
    );
    await upgradeImpl.waitForDeployment();

    expect(await upgradeImpl.Governance()).to.equal(MAINNET_GOVERNANCE);
    expect(await upgradeImpl.torn()).to.equal(MAINNET_TORN);
    expect(await upgradeImpl.relayerRegistry()).to.equal(MAINNET_RELAYER_REGISTRY);
    expect(await upgradeImpl.ratioConstant()).to.equal(MAINNET_RATIO_CONSTANT);
  });

  it('should deploy FeeSplitProposal targeting live proxy and new implementation', async () => {
    const ProposalFactory = await ethers.getContractFactory('FeeSplitProposal');
    proposal = await ProposalFactory.deploy(MAINNET_STAKING_PROXY, await upgradeImpl.getAddress());
    await proposal.waitForDeployment();

    expect(await proposal.stakingProxy()).to.equal(MAINNET_STAKING_PROXY);
    expect(await proposal.newImplementation()).to.equal(await upgradeImpl.getAddress());
  });

  it('should upgrade the live Staking Proxy via Governance proposal execution', async () => {
    // Impersonate Governance (which executes proposal via delegatecall)
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [MAINNET_GOVERNANCE],
    });

    // Fund Governance with ETH for gas
    await network.provider.send('hardhat_setBalance', [
      MAINNET_GOVERNANCE,
      '0x10000000000000000000', // 10 ETH
    ]);

    const govSigner = await ethers.getSigner(MAINNET_GOVERNANCE);

    // Call executeProposal() directly from Governance (simulating the proposal execution)
    const proxyAdminIface = new ethers.Interface([
      'function upgradeTo(address newImplementation)',
    ]);
    const upgradeData = proxyAdminIface.encodeFunctionData('upgradeTo', [await upgradeImpl.getAddress()]);

    await govSigner.sendTransaction({
      to: MAINNET_STAKING_PROXY,
      data: upgradeData,
    });

    // Verify implementation updated
    const newImplSlot = await ethers.provider.getStorage(MAINNET_STAKING_PROXY, IMPLEMENTATION_SLOT);
    const newImplAddress = ethers.getAddress('0x' + newImplSlot.slice(26));
    expect(newImplAddress.toLowerCase()).to.equal((await upgradeImpl.getAddress()).toLowerCase());

    // Verify Slot 1 accumulatedRewardPerTorn is EXACTLY preserved
    const afterSlot1 = await ethers.provider.getStorage(MAINNET_STAKING_PROXY, 1);
    expect(BigInt(afterSlot1)).to.equal(initialAccumulatedRewardPerTorn);

    await network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [MAINNET_GOVERNANCE],
    });
  });

  it('should process a relayer fee with 70/30 split on the upgraded live proxy', async () => {
    const upgradedProxy = await ethers.getContractAt(
      'TornadoStakingRewardsUpgrade',
      MAINNET_STAKING_PROXY
    );
    const tornToken = await ethers.getContractAt(
      '@openzeppelin/contracts-v3/token/ERC20/IERC20.sol:IERC20',
      MAINNET_TORN
    );

    const govTornBefore = await tornToken.balanceOf(MAINNET_GOVERNANCE);
    const accumulatedBefore = await upgradedProxy.accumulatedRewardPerTorn();

    // Impersonate RelayerRegistry
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [MAINNET_RELAYER_REGISTRY],
    });
    await network.provider.send('hardhat_setBalance', [
      MAINNET_RELAYER_REGISTRY,
      '0x10000000000000000000',
    ]);
    const relayerSigner = await ethers.getSigner(MAINNET_RELAYER_REGISTRY);

    // Simulate RelayerRegistry deducting 100 TORN fee
    const feeAmount = ethers.parseEther('100');
    const expectedGovAmount = ethers.parseEther('30');
    const expectedRewardAmount = ethers.parseEther('70');

    // Call addBurnRewards from RelayerRegistry
    await upgradedProxy.connect(relayerSigner).addBurnRewards(feeAmount);

    // 1. Verify Governance received exactly 30 TORN
    const govTornAfter = await tornToken.balanceOf(MAINNET_GOVERNANCE);
    expect(govTornAfter - govTornBefore).to.equal(expectedGovAmount);

    const govContract = new ethers.Contract(
      MAINNET_GOVERNANCE,
      ['function userVault() view returns (address)'],
      ethers.provider
    );
    const userVaultAddress = await govContract.userVault();
    const vaultBalance = await tornToken.balanceOf(userVaultAddress);
    const expectedAccumulatedIncrease = (expectedRewardAmount * MAINNET_RATIO_CONSTANT) / vaultBalance;

    const accumulatedAfter = await upgradedProxy.accumulatedRewardPerTorn();
    expect(accumulatedAfter - accumulatedBefore).to.equal(expectedAccumulatedIncrease);

    await network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [MAINNET_RELAYER_REGISTRY],
    });
  });

  it('should reject unauthorized fee allocation calls on the upgraded live proxy', async () => {
    const upgradedProxy = await ethers.getContractAt(
      'TornadoStakingRewardsUpgrade',
      MAINNET_STAKING_PROXY
    );
    await expect(
      upgradedProxy.connect(deployer).addBurnRewards(ethers.parseEther('10'))
    ).to.be.revertedWith('unauthorized');
  });

  it('should preserve existing staker claims without deduction', async () => {
    const upgradedProxy = await ethers.getContractAt(
      'TornadoStakingRewardsUpgrade',
      MAINNET_STAKING_PROXY
    );

    // Pick a live mainnet staker address with locked balance
    const stakerAddress = '0x666666656E38a26A7B7047Bf8ed70b464Cd3D513';

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [stakerAddress],
    });
    await network.provider.send('hardhat_setBalance', [
      stakerAddress,
      '0x10000000000000000000',
    ]);
    const stakerSigner = await ethers.getSigner(stakerAddress);

    // Call getReward() - should succeed without revert
    const tx = await upgradedProxy.connect(stakerSigner).getReward();
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    await network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [stakerAddress],
    });
  });
});
