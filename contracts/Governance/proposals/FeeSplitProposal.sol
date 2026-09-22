// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import { AdminUpgradeableProxy } from "../AdminUpgradeableProxy.sol";

/**
 * @notice Governance proposal to upgrade TornadoStakingRewards to the 70/30 fee split implementation.
 *         Executed via delegatecall from the Tornado Governance contract.
 */
contract FeeSplitProposal {
    address payable public immutable stakingProxy;
    address public immutable newImplementation;

    constructor(address payable _stakingProxy, address _newImplementation) public {
        require(_stakingProxy != address(0), "FeeSplitProposal: zero staking proxy");
        require(_newImplementation != address(0), "FeeSplitProposal: zero implementation");
        stakingProxy = _stakingProxy;
        newImplementation = _newImplementation;
    }

    /// @notice Executed by Governance via delegatecall upon proposal execution
    function executeProposal() external {
        AdminUpgradeableProxy(stakingProxy).upgradeTo(newImplementation);
    }
}
