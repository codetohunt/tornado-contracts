// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

interface ITornadoVault {
    function withdrawTorn(address recipient, uint256 amount) external;
}

contract MockGovernanceForStaking {
    mapping(address => uint256) public lockedBalance;
    ITornadoVault public userVault;

    receive() external payable {}

    function setUserVault(address _vault) external {
        userVault = ITornadoVault(_vault);
    }

    function setLockedBalance(address account, uint256 amount) external {
        lockedBalance[account] = amount;
    }

    /// @notice Simulates proposal delegatecall execution in Governance context
    function executeProposal(address target) external returns (bool) {
        (bool success, bytes memory data) = target.delegatecall(abi.encodeWithSignature("executeProposal()"));
        if (!success) {
            if (data.length > 0) {
                assembly {
                    revert(add(32, data), mload(data))
                }
            } else {
                revert("Proposal execution failed");
            }
        }
        return true;
    }
}
