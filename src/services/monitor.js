import { MeteoraDlmmProgram, TokenProgram } from "../config/constants.js";
import { connection } from "../utils/solana.js";
import { fetchTransaction, getAccountData } from "../services/solana.js"
import { LbPair } from "../utils/decode.js"

const targets = [
    "Program log: Instruction: AddLiquidityByStrategy"
]

const invoke = "Program LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo invoke"

const checkLogs = (logs) => {

    let fetchIt = false
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i]
        if (!log.startsWith(invoke)) continue
        const nextLog = logs[i + 1]
        if (targets.includes(nextLog)) {
            fetchIt = true
            break
        }
    }

    return fetchIt
}

export const inspectSignature = async (signature) => {

    const tx = await fetchTransaction(signature)
    const blockTime = tx.blockTime
    const liqudityAdditionInstructions = filterLiquidtyAdditionInstructions(tx.transaction.message.instructions)
    if (liqudityAdditionInstructions.length == 0) {
        return
    }
    let _t = false
    for (let i = 0; i < liqudityAdditionInstructions.length; i++) {
        let t = await inspectInstruction(liqudityAdditionInstructions[i], blockTime)
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

const inspectInstruction = async (instruction, tradeTime) => {

    const lpPair = instruction.accounts[1]
    const pairData = await getAccountData(lpPair)
    const decodedPairData = LbPair.decode(pairData.value.data)
    const activationPoint = Number(decodedPairData.activationPoint)
    //console.log("Activation point", activationPoint, lpPair.toBase58())
    if (activationPoint > 0) {
        console.log("Activation point is not 0", activationPoint, lpPair.toBase58())
    }
    if (activationPoint > tradeTime) {
        console.log("Activation point not reached yet", activationPoint, lpPair.toBase58())
        return true
    }

    return false

}

let signatures = []
export const monitorLiqudity = () => {
    connection.onLogs(MeteoraDlmmProgram, async ({ logs, signature, err }) => {

        if (err) return
        if (signatures.includes(signature)) return
        signatures.push(signature)
        if (signatures.length > 100) {
            signatures = signatures.slice(1)
        }
        if (!checkLogs(logs)) return

        inspectSignature(signature)
    }, "confirmed")
}