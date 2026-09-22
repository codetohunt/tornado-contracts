import { ethers, network } from 'hardhat';

export const MAINNET_CONFIG = {
  governance: '0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce',
  torn: '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C',
  relayerRegistry: '0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2',
  stakingProxy: '0x5B3f656C80E8ddb9ec01Dd9018815576E9238c29',
  ratioConstant: '0x84594f3c17ca0a8113ea1', // 10^25 scale factor
};

export async function deployFeeSplitUpgrade() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log('====================================================');
  console.log('Deploying Tornado Staking 70/30 Fee Split Upgrade');
  console.log('====================================================');
  console.log(`Network:          ${network.name}`);
  console.log(`Deployer:         ${deployer.address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  const governanceAddress = process.env.GOVERNANCE_ADDRESS || MAINNET_CONFIG.governance;
  const tornAddress = process.env.TORN_ADDRESS || MAINNET_CONFIG.torn;
  const relayerRegistryAddress = process.env.RELAYER_REGISTRY_ADDRESS || MAINNET_CONFIG.relayerRegistry;
  const stakingProxyAddress = (process.env.STAKING_PROXY_ADDRESS || MAINNET_CONFIG.stakingProxy) as string;
  const ratioConstant = process.env.RATIO_CONSTANT || MAINNET_CONFIG.ratioConstant;

  console.log('\nDeployment Configuration:');
  console.log(`- Governance:       ${governanceAddress}`);
  console.log(`- TORN Token:       ${tornAddress}`);
  console.log(`- RelayerRegistry:  ${relayerRegistryAddress}`);
  console.log(`- StakingProxy:     ${stakingProxyAddress}`);
  console.log(`- ratioConstant:    ${ratioConstant}`);

  // 1. Deploy TornadoStakingRewardsUpgrade implementation
  console.log('\n1. Deploying TornadoStakingRewardsUpgrade implementation...');
  const StakingRewardsUpgradeFactory = await ethers.getContractFactory('TornadoStakingRewardsUpgrade');
  const upgradeImplementation = await StakingRewardsUpgradeFactory.deploy(
    governanceAddress,
    tornAddress,
    relayerRegistryAddress,
    ratioConstant
  );
  await upgradeImplementation.waitForDeployment();
  const upgradeImplAddress = await upgradeImplementation.getAddress();
  const implTx = upgradeImplementation.deploymentTransaction();
  console.log(`   Implementation deployed at: ${upgradeImplAddress}`);
  console.log(`   Transaction hash:           ${implTx?.hash}`);

  // 2. Deploy FeeSplitProposal pointing to proxy and new implementation
  console.log('\n2. Deploying FeeSplitProposal...');
  const FeeSplitProposalFactory = await ethers.getContractFactory('FeeSplitProposal');
  const proposal = await FeeSplitProposalFactory.deploy(
    stakingProxyAddress,
    upgradeImplAddress
  );
  await proposal.waitForDeployment();
  const proposalAddress = await proposal.getAddress();
  const proposalTx = proposal.deploymentTransaction();
  console.log(`   FeeSplitProposal deployed at: ${proposalAddress}`);
  console.log(`   Transaction hash:             ${proposalTx?.hash}`);

  // 3. Output Etherscan Verification Commands
  console.log('\n====================================================');
  console.log('Contract Verification Commands');
  console.log('====================================================');
  console.log(`npx hardhat verify --network ${network.name} ${upgradeImplAddress} "${governanceAddress}" "${tornAddress}" "${relayerRegistryAddress}" "${ratioConstant}"`);
  console.log(`npx hardhat verify --network ${network.name} ${proposalAddress} "${stakingProxyAddress}" "${upgradeImplAddress}"`);

  // 4. Output Governance Proposal Submission Instructions
  console.log('\n====================================================');
  console.log('Governance Proposal Submission');
  console.log('====================================================');
  console.log(`Target Contract for propose(): ${proposalAddress}`);
  console.log('Proposal Description example:');
  console.log('"Upgrade TornadoStakingRewards to 70/30 Fee Split (30% to DAO Treasury, 70% to Stakers)"');
  console.log('====================================================');

  return {
    upgradeImplementation,
    proposal,
    upgradeImplAddress,
    proposalAddress,
  };
}

// Only execute directly when script is run via CLI
if (require.main === module) {
  deployFeeSplitUpgrade()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
