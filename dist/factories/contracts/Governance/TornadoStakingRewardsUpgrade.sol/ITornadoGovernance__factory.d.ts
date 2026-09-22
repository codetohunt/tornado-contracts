import { type ContractRunner } from "ethers";
import type { ITornadoGovernance, ITornadoGovernanceInterface } from "../../../../contracts/Governance/TornadoStakingRewardsUpgrade.sol/ITornadoGovernance";
export declare class ITornadoGovernance__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "lockedBalance";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "userVault";
        readonly outputs: readonly [{
            readonly internalType: "contract ITornadoVault";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ITornadoGovernanceInterface;
    static connect(address: string, runner?: ContractRunner | null): ITornadoGovernance;
}
