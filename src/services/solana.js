import { PublicKey } from "@solana/web3.js"
import { connection } from "../utils/solana.js"
import { MetadataProgram, RETRY_ATTEMPTS, RETRY_DELAY } from "../config/constants.js"
import { Logger } from "../utils/logger.js"

const fetchTransactionLogger = new Logger('Fetch Transaction')

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const fetchTransaction = async (signature) => {

    if (!signature) throw new Error('Signature is required')

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        if (attempt > 1) await sleep(RETRY_DELAY * attempt)
        fetchTransactionLogger.countRequest()
        try {
            const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" })
            if (tx) return tx
        } catch (err) {
            fetchTransactionLogger.logError(err)
        }
    }

    throw new Error(`Failed to fetch transaction ${signature}`)

}


const getAccountDataLogger = new Logger('Get Account Data')
export const getAccountData = async (publicKey) => {
    getAccountDataLogger.countRequest()
    try {
        return await connection.getParsedAccountInfo(publicKey)
    } catch (err) {
        getAccountDataLogger.logError(err)
        return null
    }

}

const getMetadataLogger = new Logger('Get Metadata')
export const getMetadata = async (tokenAddress) => {
    getMetadataLogger.countRequest()

    try {

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

    } catch (err) {
        getMetadataLogger.logError(err)
        return { name: undefined, symbol: undefined, description: undefined, image: undefined }
    }


}

// const getTokenDecimalsFromTransactionLogger = new Logger('Get Token Decimals From Transaction')
// export const getTokenAccountBalance = async (publicKey) => {
//     getTokenDecimalsFromTransactionLogger.count++
//     return await connection.getTokenAccountBalance(publicKey)

// }