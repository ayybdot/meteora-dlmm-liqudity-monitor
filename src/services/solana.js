import { connection } from "../utils/solana.js"

export const fetchTransaction = async (signature) => {

    const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion : 0, commitment: "confirmed"})
    if (!tx) throw new Error('Transaction not found')
    return tx

}

export const getAccountData = async (publicKey) => {

    return await connection.getParsedAccountInfo(publicKey)

}