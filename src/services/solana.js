import { PublicKey } from "@solana/web3.js"
import { connection } from "../utils/solana.js"
import { MetadataProgram } from "../config/constants.js"
import { Logger } from "../utils/logger.js"

const fetchTransactionLogger = new Logger('Fetch Transaction')
export const fetchTransaction = async (signature) => {
    fetchTransactionLogger.count++
    const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" })
    if (!tx) throw new Error('Transaction not found')
    return tx

}


const getAccountDataLogger = new Logger('Get Account Data')
export const getAccountData = async (publicKey) => {
    getAccountDataLogger.count++
    return await connection.getParsedAccountInfo(publicKey)

}

const getMetadataLogger = new Logger('Get Metadata')
export const getMetadata = async (tokenAddress) => {
    getMetadataLogger.count++
    const metadataPda = PublicKey.findProgramAddressSync([Buffer.from("metadata"), MetadataProgram.toBuffer(), tokenAddress.toBuffer()], MetadataProgram)[0]

    const accountInfo = await connection.getAccountInfo(metadataPda)

    const metadata = accountInfo.data

    const arrayData = Array.from(metadata)

    const nameData = arrayData.slice(66, 101)
    const name = String.fromCharCode(...nameData).trim()

    const symbolData = arrayData.slice(102, 115)
    const symbol = String.fromCharCode(...symbolData).trim()

    const uriData = arrayData.slice(116, 319)
    const uri = String.fromCharCode(...uriData).trim()

    try {
        new URL(uri)
    } catch (e) {
        return { name, symbol, description: undefined, image: undefined }
    }

    const metadataJson = await fetch(uri).then(res => res.json())

    if (metadataJson === null) return { name, symbol, description: undefined, image: undefined }

    return {
        name,
        symbol,
        description: metadataJson.description,
        image: metadataJson.image,
        extensions: metadataJson.extensions
    }

}

const getTokenDecimalsFromTransactionLogger = new Logger('Get Token Decimals From Transaction')
export const getTokenAccountBalance = async (publicKey) => {
    getTokenDecimalsFromTransactionLogger.count++
    return await connection.getTokenAccountBalance(publicKey)

}