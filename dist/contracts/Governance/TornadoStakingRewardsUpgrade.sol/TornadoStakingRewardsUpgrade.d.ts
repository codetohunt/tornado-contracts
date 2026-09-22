import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../common";
export interface TornadoStakingRewardsUpgradeInterface extends Interface {
    getFunction(nameOrSignature: "Governance" | "accumulatedRewardPerTorn" | "accumulatedRewardRateOnLastUpdate" | "accumulatedRewards" | "addBurnRewards" | "checkReward" | "getReward" | "ratioConstant" | "relayerRegistry" | "setReward" | "torn" | "updateRewardsOnLockedBalanceChange" | "withdrawTorn"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "ProtocolFeeAllocated" | "RewardsClaimed" | "RewardsUpdated"): EventFragment;
    encodeFunctionData(functionFragment: "Governance", values?: undefined): string;
    encodeFunctionData(functionFragment: "accumulatedRewardPerTorn", values?: undefined): string;
    encodeFunctionData(functionFragment: "accumulatedRewardRateOnLastUpdate", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "accumulatedRewards", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "addBurnRewards", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "checkReward", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "getReward", values?: undefined): string;
    encodeFunctionData(functionFragment: "ratioConstant", values?: undefined): string;
    encodeFunctionData(functionFragment: "relayerRegistry", values?: undefined): string;
    encodeFunctionData(functionFragment: "setReward", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "torn", values?: undefined): string;
    encodeFunctionData(functionFragment: "updateRewardsOnLockedBalanceChange", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "withdrawTorn", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "Governance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accumulatedRewardPerTorn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accumulatedRewardRateOnLastUpdate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accumulatedRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addBurnRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "checkReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ratioConstant", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "relayerRegistry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setReward", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "torn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateRewardsOnLockedBalanceChange", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTorn", data: BytesLike): Result;
}
export declare namespace ProtocolFeeAllocatedEvent {
    type InputTuple = [
        feeAmount: BigNumberish,
        rewardAmount: BigNumberish,
        governanceAmount: BigNumberish
    ];
    type OutputTuple = [
        feeAmount: bigint,
        rewardAmount: bigint,
        governanceAmount: bigint
    ];
    interface OutputObject {
        feeAmount: bigint;
        rewardAmount: bigint;
        governanceAmount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace RewardsClaimedEvent {
    type InputTuple = [account: AddressLike, rewardsClaimed: BigNumberish];
    type OutputTuple = [account: string, rewardsClaimed: bigint];
    interface OutputObject {
        account: string;
        rewardsClaimed: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace RewardsUpdatedEvent {
    type InputTuple = [account: AddressLike, rewards: BigNumberish];
    type OutputTuple = [account: string, rewards: bigint];
    interface OutputObject {
        account: string;
        rewards: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface TornadoStakingRewardsUpgrade extends BaseContract {
    connect(runner?: ContractRunner | null): TornadoStakingRewardsUpgrade;
    waitForDeployment(): Promise<this>;
    interface: TornadoStakingRewardsUpgradeInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    Governance: TypedContractMethod<[], [string], "view">;
    accumulatedRewardPerTorn: TypedContractMethod<[], [bigint], "view">;
    accumulatedRewardRateOnLastUpdate: TypedContractMethod<[
        arg0: AddressLike
    ], [
        bigint
    ], "view">;
    accumulatedRewards: TypedContractMethod<[
        arg0: AddressLike
    ], [
        bigint
    ], "view">;
    addBurnRewards: TypedContractMethod<[
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    checkReward: TypedContractMethod<[account: AddressLike], [bigint], "view">;
    getReward: TypedContractMethod<[], [void], "nonpayable">;
    ratioConstant: TypedContractMethod<[], [bigint], "view">;
    relayerRegistry: TypedContractMethod<[], [string], "view">;
    setReward: TypedContractMethod<[
        account: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    torn: TypedContractMethod<[], [string], "view">;
    updateRewardsOnLockedBalanceChange: TypedContractMethod<[
        account: AddressLike,
        amountLockedBeforehand: BigNumberish
    ], [
        void
    ], "nonpayable">;
    withdrawTorn: TypedContractMethod<[
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "Governance"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "accumulatedRewardPerTorn"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "accumulatedRewardRateOnLastUpdate"): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "accumulatedRewards"): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "addBurnRewards"): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "checkReward"): TypedContractMethod<[account: AddressLike], [bigint], "view">;
    getFunction(nameOrSignature: "getReward"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "ratioConstant"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "relayerRegistry"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "setReward"): TypedContractMethod<[
        account: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "torn"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "updateRewardsOnLockedBalanceChange"): TypedContractMethod<[
        account: AddressLike,
        amountLockedBeforehand: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "withdrawTorn"): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    getEvent(key: "ProtocolFeeAllocated"): TypedContractEvent<ProtocolFeeAllocatedEvent.InputTuple, ProtocolFeeAllocatedEvent.OutputTuple, ProtocolFeeAllocatedEvent.OutputObject>;
    getEvent(key: "RewardsClaimed"): TypedContractEvent<RewardsClaimedEvent.InputTuple, RewardsClaimedEvent.OutputTuple, RewardsClaimedEvent.OutputObject>;
    getEvent(key: "RewardsUpdated"): TypedContractEvent<RewardsUpdatedEvent.InputTuple, RewardsUpdatedEvent.OutputTuple, RewardsUpdatedEvent.OutputObject>;
    filters: {
        "ProtocolFeeAllocated(uint256,uint256,uint256)": TypedContractEvent<ProtocolFeeAllocatedEvent.InputTuple, ProtocolFeeAllocatedEvent.OutputTuple, ProtocolFeeAllocatedEvent.OutputObject>;
        ProtocolFeeAllocated: TypedContractEvent<ProtocolFeeAllocatedEvent.InputTuple, ProtocolFeeAllocatedEvent.OutputTuple, ProtocolFeeAllocatedEvent.OutputObject>;
        "RewardsClaimed(address,uint256)": TypedContractEvent<RewardsClaimedEvent.InputTuple, RewardsClaimedEvent.OutputTuple, RewardsClaimedEvent.OutputObject>;
        RewardsClaimed: TypedContractEvent<RewardsClaimedEvent.InputTuple, RewardsClaimedEvent.OutputTuple, RewardsClaimedEvent.OutputObject>;
        "RewardsUpdated(address,uint256)": TypedContractEvent<RewardsUpdatedEvent.InputTuple, RewardsUpdatedEvent.OutputTuple, RewardsUpdatedEvent.OutputObject>;
        RewardsUpdated: TypedContractEvent<RewardsUpdatedEvent.InputTuple, RewardsUpdatedEvent.OutputTuple, RewardsUpdatedEvent.OutputObject>;
    };
}
