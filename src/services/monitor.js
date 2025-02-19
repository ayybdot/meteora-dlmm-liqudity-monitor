import { MeteoraDlmmProgram, TokenProgram } from "../config/constants.js";
import { connection, getTokenDecimalsFromTransaction } from "../utils/solana.js";
import { fetchTransaction, getAccountData, getMetadata, getTokenAccountBalance } from "../services/solana.js"
import { LbPair, LiquidityParameterByStrategy } from "../utils/decode.js"
import base58 from "bs58"
import { createEmbed, sendMessage } from "../utils/discord.js";
import { fetchPriceFromJupiter } from "./jupiter.js";
import { SIGNATURE_CACHE_SIZE } from "../config/constants.js";
import lbCache from "../utils/lbCache.js";

const targets = [
    "Program log: Instruction: AddLiquidityByStrategy"
]

const banned = [
    "Program log: Instruction: RemoveLiquidityByRange"
]

const invoke = "Program LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo invoke"

const checkLogs = (logs) => {
    const shouldFetch = logs.some((log, i) =>
        log.startsWith(invoke) && targets.includes(logs[i + 1])
    );

    return shouldFetch && !logs.some(log => banned.includes(log));
};


export const inspectSignature = async (signature) => {

    const tx = await fetchTransaction(signature)
    const liqudityAdditionInstructions = filterLiquidtyAdditionInstructions(tx.transaction.message.instructions)
    if (liqudityAdditionInstructions.length == 0) {
        return
    }
    let _t = false
    for (let i = 0; i < liqudityAdditionInstructions.length; i++) {
        let t = await inspectInstruction(liqudityAdditionInstructions[i], tx)
        if (t) _t = true
    }
    return _t
}

const filterLiquidtyAdditionInstructions = (instructions) => {

    return instructions.filter(instruction => {

        if (
            instruction.accounts?.length == 16 &&
            instruction.programId.equals(MeteoraDlmmProgram) &&
            instruction.accounts[12].equals(TokenProgram) &&
            instruction.accounts[13].equals(TokenProgram) &&
            instruction.accounts[15].equals(MeteoraDlmmProgram)
        ) return true
        return false
    })

}

const inspectInstruction = async (instruction, transaction) => {

    const lbPair = instruction.accounts[1]
    const sender = instruction.accounts[11]
    const bs58instructionData = instruction.data
    const instructionData = base58.decode(bs58instructionData)
    const decodedInstructionData = LiquidityParameterByStrategy.decode(instructionData)
    if(lbCache.isInCache(lbPair.toString())) return
    const pairData = await getAccountData(lbPair)
    const decodedPairData = LbPair.decode(pairData.value.data)
    const activationType = decodedPairData.activationType
    const activationPoint = Number(decodedPairData.activationPoint)
    const current = activationType == 0 ? transaction.slot : transaction.blockTime
    if (activationPoint > current) {
        const tokenX = instruction.accounts[7]
        const tokenY = instruction.accounts[8]
        const tokenXLamports = decodedInstructionData.amountX
        const tokenYLamports = decodedInstructionData.amountY
        const tokenXDecimals = getTokenDecimalsFromTransaction(transaction, tokenX)
        const tokenYDecimals = getTokenDecimalsFromTransaction(transaction, tokenY)
        const tokenXAmount = tokenXLamports / BigInt(Math.pow(10, tokenXDecimals))
        const tokenYAmount = tokenYLamports / BigInt(Math.pow(10, tokenYDecimals))
        const tokenXMetadata = await getMetadata(tokenX)
        const tokenYMetadata = await getMetadata(tokenY)

        const reserveX = decodedPairData.reserveX
        const reserveY = decodedPairData.reserveY
        const reserveXAmount = await getTokenAccountBalance(reserveX)
        const reserveYAmount = await getTokenAccountBalance(reserveY)
        const tokenYPrice = await fetchPriceFromJupiter(tokenY.toString())
        const reserveYValue = Number(reserveYAmount.value.uiAmount) * tokenYPrice
        const tokenXPrice = reserveYValue / Number(reserveXAmount.value.uiAmount)

        const tokenXData = { token: tokenX.toString(), amount: Number(tokenXAmount), totalPrice: Number(tokenXAmount) * tokenXPrice, name: tokenXMetadata.name, symbol: tokenXMetadata.symbol, description: tokenXMetadata.description, image: tokenXMetadata.image, extensions: tokenXMetadata.extensions }
        const tokenYData = { token: tokenY.toString(), amount: Number(tokenYAmount), totalPrice: Number(tokenYAmount) * tokenYPrice, name: tokenYMetadata.name, symbol: tokenYMetadata.symbol, description: tokenYMetadata.description, image: tokenYMetadata.image, extensions: tokenYMetadata.extensions }
        const tokens = [tokenXData, tokenYData]

        let timestamp
        if(activationType) {
            timestamp = decodedPairData.activationPoint
        }else{
            const slotDiff = 10
            const slotTime = slotDiff * 400 / 1000
            timestamp = Math.floor(transaction.blockTime + slotTime)
        }

        const embed = createEmbed(tokens, lbPair.toString(), transaction.transaction.signatures[0], sender.toString(), decodedPairData, timestamp, sender)
        await sendMessage({ embeds: [embed] })
    }else{
        lbCache.addToCache(lbPair.toString())
    }

}

class SignatureCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Set();
    }

    add(signature) {
        if (this.cache.size >= this.maxSize) {
            const firstItem = this.cache.values().next().value;
            this.cache.delete(firstItem);
        }
        this.cache.add(signature);
    }

    has(signature) {
        return this.cache.has(signature);
    }
}

const signatureCache = new SignatureCache(SIGNATURE_CACHE_SIZE);

export const monitorLiquidity = () => {
    connection.onLogs(MeteoraDlmmProgram, async ({ logs, signature, err }) => {
        if (err || signatureCache.has(signature)) return;
        signatureCache.add(signature);

        if (!checkLogs(logs)) return;

        try {
            await inspectSignature(signature);
        } catch (err) {
            console.error(`Error processing signature ${signature}:`, err);
        }
    }, "confirmed");
}