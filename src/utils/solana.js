import { Connection } from "@solana/web3.js"

const RPC_URL = process.env.RPC_URL

if (!RPC_URL) {
    throw new Error('RPC_URL is not set')
}

export const connection = new Connection(RPC_URL, 'confirmed')

export const getTokenDecimalsFromTransaction = (transaction, tokenAddress) => {

    const tokenAccounts = [...transaction.meta.postTokenBalances, ...transaction.meta.preTokenBalances]
    const tokenAccount = tokenAccounts.find(account => account.mint == tokenAddress.toString())
    return tokenAccount?.uiTokenAmount?.decimals || null

}