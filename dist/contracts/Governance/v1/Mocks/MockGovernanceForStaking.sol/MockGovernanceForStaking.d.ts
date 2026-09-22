import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../../common";
export interface MockGovernanceForStakingInterface extends Interface {
    getFunction(nameOrSignature: "executeProposal" | "lockedBalance" | "setLockedBalance" | "setUserVault" | "userVault"): FunctionFragment;
    encodeFunctionData(functionFragment: "executeProposal", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "lockedBalance", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "setLockedBalance", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setUserVault", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "userVault", values?: undefined): string;
    decodeFunctionResult(functionFragment: "executeProposal", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockedBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setLockedBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUserVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "userVault", data: BytesLike): Result;
}
export interface MockGovernanceForStaking extends BaseContract {
    connect(runner?: ContractRunner | null): MockGovernanceForStaking;
    waitForDeployment(): Promise<this>;
    interface: MockGovernanceForStakingInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    executeProposal: TypedContractMethod<[
        target: AddressLike
    ], [
        boolean
    ], "nonpayable">;
    lockedBalance: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    setLockedBalance: TypedContractMethod<[
        account: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    setUserVault: TypedContractMethod<[
        _vault: AddressLike
    ], [
        void
    ], "nonpayable">;
    userVault: TypedContractMethod<[], [string], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "executeProposal"): TypedContractMethod<[target: AddressLike], [boolean], "nonpayable">;
    getFunction(nameOrSignature: "lockedBalance"): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "setLockedBalance"): TypedContractMethod<[
        account: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "setUserVault"): TypedContractMethod<[_vault: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "userVault"): TypedContractMethod<[], [string], "view">;
    filters: {};
}
