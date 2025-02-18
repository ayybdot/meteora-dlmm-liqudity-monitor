import { f64, s32, struct, u16, u32, u8, seq } from "@solana/buffer-layout";
import { bool, publicKey, u128, u64 } from "@solana/buffer-layout-utils";


const StaticParameters = struct([
  u16("baseFactor"),
  u16("filterPeriod"),
  u16("decayPeriod"),
  u16("reductionFactor"),
  u32("variableFeeControl"),
  u32("maxVolatilityAccumulator"),
  s32("minBinId"),
  s32("maxBinId"),
  u16("protocolShare"),
  seq(u8(), 6, "padding"),
], "staticParameters");


const VariableParameters = struct([
  u32("volatilityAccumulator"),
  u32("volatilityReference"),
  s32("indexReference"),
  seq(u8(), 4, "padding"),
  u64("lastUpdateTimestamp"),
  seq(u8(), 8, "padding1"),
], "variableParameters");


const ProtocolFee = struct([
  u64("amountX"),
  u64("amountY"),
], "protocolFee");

const RewardInfo = struct([
  publicKey("mint"),
  publicKey("vault"),
  publicKey("funder"),
  u64("rewardDuration"),
  u64("rewardDurationEnd"),
  u128("rewardRate"),
  u64("lastUpdateTime"),
  u64("cumulativeSecondsWithEmptyLiquidityReward"),
], "rewardInfo");

export const LbPair = struct([
  u64("discriminator"),
  StaticParameters,
  VariableParameters,
  seq(u8(), 1, "bumpSeed"),
  seq(u8(), 2, "binStepSeed"),
  u8("pairType"),
  s32("activeId"),
  u16("binStep"),
  u8("status"),
  u8("requireBaseFactorSeed"),
  seq(u8(), 2, "baseFactorSeed"),
  u8("activationType"),
  u8("padding0"),
  publicKey("tokenXMint"),
  publicKey("tokenYMint"),
  publicKey("reserveX"),
  publicKey("reserveY"),
  ProtocolFee,
  seq(u8(), 32, "padding1"),
  seq(RewardInfo, 2, "rewardInfos"),
  publicKey("oracle"),
  seq(u64(), 16, "binArrayBitmap"),
  u64("lastUpdatedAt"),
  seq(u8(), 32, "padding2"),
  publicKey("preActivationSwapAddress"),
  publicKey("baseKey"),
  u64("activationPoint"),
  u64("preActivationDuration"),
  seq(u8(), 8, "padding3"),
  u64("padding4"),
  publicKey("creator"),
  seq(u8(), 24, "reserved"),
]);

const StrategyParameters = struct([
  s32("minBinId"),
  s32("maxBinId"),
  u8("strategyType"),  
  seq(u8(), 64, "parameters")
], "strategyParameters")

export const LiquidityParameterByStrategy = struct([
  u64("discriminator"),
  u64("amountX"),
  u64("amountY"),
  s32("activeId"),
  s32("maxActiveBinSlippage"),
  StrategyParameters
]);