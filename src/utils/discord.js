export const createEmbed = (tokens, poolAddress, signature, user, lbPair, activationTimestamp, sender) => {


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
            { name : `Activation Time`, value : `<t:${activationTimestamp}>`},
            { name : `Pool Address`, value: `[${poolAddress}](https://solscan.io/address/${poolAddress})`},
            { name : `Token Address`, value: `[${tokens[0].token}](https://solscan.io/address/${tokens[0].token})`},
            { name : `Pool Creator`, value: `[${user}](https://solscan.io/address/${lbPair.creator})`},
            { name : `Payer`, value: `[${sender}](https://solscan.io/address/${sender})`},
            { name : "Links", value : `[Birdeye](https://birdeye.so/token/${poolAddress}) | [Dexscreener](https://dexscreener.com/solana/${poolAddress}) | [Rugcheck](https://rugcheck.xyz/tokens/${poolAddress}) | [Transaction](https://solscan.io/tx/${signature})`}
        ],
        thumbnail : { url: tokens[0].image},
        footer : { text: "Powered by nawadotdev"}
    }

}

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const sendMessage = async (message) => {
    if (!WEBHOOK_URL) {
        throw new Error("DISCORD_WEBHOOK_URL is not defined");
    }

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ embeds: message.embeds, content : DISCORD_ROLE_ID ? `<@&${DISCORD_ROLE_ID}>` : null })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return;
        } catch (error) {
            console.error(`Discord webhook attempt ${attempt} failed:`, error);
            
            if (attempt === RETRY_ATTEMPTS) {
                throw error;
            }
            
            await sleep(RETRY_DELAY * attempt);
        }
    }
}