export const createEmbed = (tokens, poolAddress, signature, user, lbPair) => {

    const poolName = `${tokens[0].symbol || "Unkown"} - ${tokens[1].symbol || "Unknown"}`

    const addedFields = tokens.map(token => {
        return {
            name : `Added ${token.symbol} Amount`,
            value : `${token.amount.toLocaleString()} (${token.totalPrice.toLocaleString()} USDC)`,
        }
    })

    return {
        title : `Liquidity Added to ${poolName}`,
        fields : [
            ...addedFields,
            { name : `Activation Time`, value : `<t:${lbPair.activationPoint}>`},
            { name : `Pool Address`, value: `[${poolAddress}](https://solscan.io/address/${poolAddress})`},
            { name : `Token Address`, value: `[${tokens[0].token}](https://solscan.io/address/${tokens[0].token})`},
            { name : `Pool Creator`, value: `[${user}](https://solscan.io/address/${lbPair.creator})`},
            { name : "Links", value : `[Birdeye](https://birdeye.so/token/${poolAddress}) | [Dexscreener](https://dexscreener.com/solana/${poolAddress}) | [Rugcheck](https://rugcheck.xyz/tokens/${poolAddress}) | [Transaction](https://solscan.io/tx/${signature})`}
        ],
        thumbnail : { url: tokens[0].image},
        footer : { text: "Powered by nawadotdev"}
    }

}

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
if (!WEBHOOK_URL) {
    throw new Error("DISCORD_WEBHOOK_URL is not defined")
}

export const sendMessage = async (message) => {
    await fetch(`${WEBHOOK_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ embeds: message.embeds })
    }).catch(console.error)

}