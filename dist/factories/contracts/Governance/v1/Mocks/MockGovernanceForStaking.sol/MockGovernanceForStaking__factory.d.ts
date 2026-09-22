import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../../common";
import type { MockGovernanceForStaking, MockGovernanceForStakingInterface } from "../../../../../../contracts/Governance/v1/Mocks/MockGovernanceForStaking.sol/MockGovernanceForStaking";
type MockGovernanceForStakingConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MockGovernanceForStaking__factory extends ContractFactory {
    constructor(...args: MockGovernanceForStakingConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<MockGovernanceForStaking & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): MockGovernanceForStaking__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610358806100206000396000f3fe60806040526004361061004e5760003560e01c80638b0e8e671461005a5780639ae697bf1461008f5780639daafec7146100d4578063a4203fe514610105578063a67a03ab1461013e57610055565b3661005557005b600080fd5b34801561006657600080fd5b5061008d6004803603602081101561007d57600080fd5b50356001600160a01b0316610185565b005b34801561009b57600080fd5b506100c2600480360360208110156100b257600080fd5b50356001600160a01b03166101a7565b60408051918252519081900360200190f35b3480156100e057600080fd5b506100e96101b9565b604080516001600160a01b039092168252519081900360200190f35b34801561011157600080fd5b5061008d6004803603604081101561012857600080fd5b506001600160a01b0381351690602001356101c8565b34801561014a57600080fd5b506101716004803603602081101561016157600080fd5b50356001600160a01b03166101e4565b604080519115158252519081900360200190f35b600180546001600160a01b0319166001600160a01b0392909216919091179055565b60006020819052908152604090205481565b6001546001600160a01b031681565b6001600160a01b03909116600090815260208190526040902055565b60408051600481526024810182526020810180516001600160e01b03166306e60b1760e31b1781529151815160009384936060936001600160a01b03881693919290918291908083835b6020831061024d5780518252601f19909201916020918201910161022e565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d80600081146102ad576040519150601f19603f3d011682016040523d82523d6000602084013e6102b2565b606091505b509150915081610318578051156102cb57805181602001fd5b6040805162461bcd60e51b815260206004820152601960248201527f50726f706f73616c20657865637574696f6e206661696c656400000000000000604482015290519081900360640190fd5b506001939250505056fea2646970667358221220f43785bc559ffa5eeff04321c6faaa5161f5d618284782042016b07cccce4b4364736f6c634300060c0033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }];
        readonly name: "executeProposal";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
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
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "setLockedBalance";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_vault";
            readonly type: "address";
        }];
        readonly name: "setUserVault";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): MockGovernanceForStakingInterface;
    static connect(address: string, runner?: ContractRunner | null): MockGovernanceForStaking;
}
export {};
