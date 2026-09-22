import { type ContractRunner } from "ethers";
import type { ITornadoVault, ITornadoVaultInterface } from "../../../../contracts/Governance/TornadoStakingRewardsUpgrade.sol/ITornadoVault";
export declare class ITornadoVault__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "withdrawTorn";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITornadoVaultInterface;
    static connect(address: string, runner?: ContractRunner | null): ITornadoVault;
}
