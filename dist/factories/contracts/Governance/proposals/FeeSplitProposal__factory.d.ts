import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { FeeSplitProposal, FeeSplitProposalInterface } from "../../../../contracts/Governance/proposals/FeeSplitProposal";
type FeeSplitProposalConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class FeeSplitProposal__factory extends ContractFactory {
    constructor(...args: FeeSplitProposalConstructorParams);
    getDeployTransaction(_stakingProxy: AddressLike, _newImplementation: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(_stakingProxy: AddressLike, _newImplementation: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<FeeSplitProposal & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): FeeSplitProposal__factory;
    static readonly bytecode = "0x60c060405234801561001057600080fd5b506040516102fb3803806102fb8339818101604052604081101561003357600080fd5b5080516020909101516001600160a01b0382166100815760405162461bcd60e51b81526004018080602001828103825260248152602001806102d76024913960400191505060405180910390fd5b6001600160a01b0381166100c65760405162461bcd60e51b81526004018080602001828103825260258152602001806102b26025913960400191505060405180910390fd5b6001600160601b0319606092831b8116608052911b1660a05260805160601c60a05160601c6101a361010f6000398060d1528061014b525080607e528060a252506101a36000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806322f80d1114610046578063373058b81461006a5780638b677b0314610074575b600080fd5b61004e61007c565b604080516001600160a01b039092168252519081900360200190f35b6100726100a0565b005b61004e610149565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316633659cfe67f00000000000000000000000000000000000000000000000000000000000000006040518263ffffffff1660e01b815260040180826001600160a01b03168152602001915050600060405180830381600087803b15801561012f57600080fd5b505af1158015610143573d6000803e3d6000fd5b50505050565b7f00000000000000000000000000000000000000000000000000000000000000008156fea26469706673582212203f8e4237d54f36dab7e2dfd9340f7bc2304e56415b1cce32a798bc7ed053b3ba64736f6c634300060c003346656553706c697450726f706f73616c3a207a65726f20696d706c656d656e746174696f6e46656553706c697450726f706f73616c3a207a65726f207374616b696e672070726f7879";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address payable";
            readonly name: "_stakingProxy";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_newImplementation";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "executeProposal";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "newImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "stakingProxy";
        readonly outputs: readonly [{
            readonly internalType: "address payable";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): FeeSplitProposalInterface;
    static connect(address: string, runner?: ContractRunner | null): FeeSplitProposal;
}
export {};
