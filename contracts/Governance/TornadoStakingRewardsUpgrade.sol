// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts-v3/token/ERC20/IERC20.sol";
import { SafeMath } from "@openzeppelin/contracts-v3/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts-v3/token/ERC20/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-v3/proxy/Initializable.sol";

interface ITornadoVault {
    function withdrawTorn(address recipient, uint256 amount) external;
}

interface ITornadoGovernance {
    function lockedBalance(address account) external view returns (uint256);

    function userVault() external view returns (ITornadoVault);
}

/**
 * @notice Upgraded Staking Rewards contract for Tornado Cash DAO Governance.
 *         - Splits new protocol fees deducted by RelayerRegistry:
 *           - 70% credited to Staking Rewards.
 *           - 30% transferred directly to the Governance address (DAO Treasury).
 *         - Preserves exact storage layout and historical reward scale of existing proxy.
 */
contract TornadoStakingRewardsUpgrade is Initializable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @notice Reward scaling coefficient (must match the existing deployment scale)
    uint256 public immutable ratioConstant;
    ITornadoGovernance public immutable Governance;
    IERC20 public immutable torn;
    address public immutable relayerRegistry;

    /// @notice The sum (reward_amount_i / locked_amount_i) * ratioConstant where i is incremented at each fee
    uint256 public accumulatedRewardPerTorn;
    /// @notice Notes down accumulatedRewardPerTorn for an address on a lock/unlock/claim
    mapping(address => uint256) public accumulatedRewardRateOnLastUpdate;
    /// @notice Notes down how much an account may claim
    mapping(address => uint256) public accumulatedRewards;

    event RewardsUpdated(address indexed account, uint256 rewards);
    event RewardsClaimed(address indexed account, uint256 rewardsClaimed);
    event ProtocolFeeAllocated(
        uint256 feeAmount,
        uint256 rewardAmount,
        uint256 governanceAmount
    );

    modifier onlyGovernance() {
        require(msg.sender == address(Governance), "only governance");
        _;
    }

    /**
     * @param governanceAddress Address of the Tornado Governance contract
     * @param tornAddress Address of the TORN ERC20 token
     * @param _relayerRegistry Address of the RelayerRegistry contract
     * @param _ratioConstant Preserved ratioConstant matching the current Staking deployment
     */
    constructor(
        address governanceAddress,
        address tornAddress,
        address _relayerRegistry,
        uint256 _ratioConstant
    ) public {
        require(governanceAddress != address(0), "TornadoStakingRewards: zero governance");
        require(tornAddress != address(0), "TornadoStakingRewards: zero torn");
        require(_relayerRegistry != address(0), "TornadoStakingRewards: zero relayer registry");
        require(_ratioConstant > 0, "TornadoStakingRewards: zero ratio constant");

        Governance = ITornadoGovernance(governanceAddress);
        torn = IERC20(tornAddress);
        relayerRegistry = _relayerRegistry;
        ratioConstant = _ratioConstant;
    }

    /**
     * @notice Allows a staker to claim accrued rewards.
     */
    function getReward() external {
        uint256 rewards = _updateReward(msg.sender, Governance.lockedBalance(msg.sender));
        rewards = rewards.add(accumulatedRewards[msg.sender]);
        accumulatedRewards[msg.sender] = 0;
        torn.safeTransfer(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @notice Processes protocol fee allocation.
     *         - If called by RelayerRegistry:
     *           30% transferred directly to Governance, 70% credited to staking rewards.
     *         - If called by Governance:
     *           100% credited to staking rewards (preserving original compensation/rescue semantics).
     * @param amount Protocol fee amount deducted from Relayer stake
     */
    function addBurnRewards(uint256 amount) external {
        require(msg.sender == address(Governance) || msg.sender == relayerRegistry, "unauthorized");

        if (msg.sender == relayerRegistry) {
            uint256 governanceAmount = amount.mul(30).div(100);
            uint256 rewardAmount = amount.sub(governanceAmount);

            accumulatedRewardPerTorn = accumulatedRewardPerTorn.add(
                rewardAmount.mul(ratioConstant).div(torn.balanceOf(address(Governance.userVault())))
            );

            if (governanceAmount > 0) {
                torn.safeTransfer(address(Governance), governanceAmount);
            }

            emit ProtocolFeeAllocated(amount, rewardAmount, governanceAmount);
        } else {
            // Direct call from Governance: 100% allocated to staking rewards without deduction
            accumulatedRewardPerTorn = accumulatedRewardPerTorn.add(
                amount.mul(ratioConstant).div(torn.balanceOf(address(Governance.userVault())))
            );
        }
    }

    /**
     * @notice Allows Governance to update the accumulated rewards rate for an account upon lock/unlock
     * @param account Address of account to update data for
     * @param amountLockedBeforehand The balance locked beforehand in the governance contract
     */
    function updateRewardsOnLockedBalanceChange(address account, uint256 amountLockedBeforehand)
        external
        onlyGovernance
    {
        uint256 claimed = _updateReward(account, amountLockedBeforehand);
        accumulatedRewards[account] = accumulatedRewards[account].add(claimed);
    }

    /**
     * @notice Allows Governance to directly set accumulated rewards amount for an account in case of emergency fix
     * @param account Address of account to set rewards amount
     * @param amount Expected account accumulated rewards balance
     */
    function setReward(address account, uint256 amount) external onlyGovernance {
        accumulatedRewards[account] = amount;
    }

    /**
     * @notice Allows Governance to rescue tokens from the staking rewards contract
     * @param amount Amount of TORN to withdraw, or uint256(-1) for full balance
     */
    function withdrawTorn(uint256 amount) external onlyGovernance {
        if (amount == type(uint256).max) amount = torn.balanceOf(address(this));
        torn.safeTransfer(address(Governance), amount);
    }

    /**
     * @notice Calculates the proper amount of rewards attributed to user since the last update
     * @param account Address of account to calculate rewards for
     * @param amountLockedBeforehand The balance locked beforehand in the governance contract
     * @return claimed The rewards attributed to user since the last update
     */
    function _updateReward(address account, uint256 amountLockedBeforehand)
        private
        returns (uint256 claimed)
    {
        if (amountLockedBeforehand != 0) {
            claimed = (accumulatedRewardPerTorn.sub(accumulatedRewardRateOnLastUpdate[account])).mul(
                amountLockedBeforehand
            ).div(ratioConstant);
        }
        accumulatedRewardRateOnLastUpdate[account] = accumulatedRewardPerTorn;
        emit RewardsUpdated(account, claimed);
    }

    /**
     * @notice View function to check total claimable rewards for an account
     * @param account Address of account to calculate rewards for
     */
    function checkReward(address account) external view returns (uint256 rewards) {
        uint256 amountLocked = Governance.lockedBalance(account);
        if (amountLocked != 0) {
            rewards = (accumulatedRewardPerTorn.sub(accumulatedRewardRateOnLastUpdate[account])).mul(
                amountLocked
            ).div(ratioConstant);
        }
        rewards = rewards.add(accumulatedRewards[account]);
    }
}
