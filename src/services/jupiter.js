import { Logger } from "../utils/logger.js"

const fetchPriceFromJupiterLogger = new Logger('FetchPriceFromJupiter')
export const fetchPriceFromJupiter = async (tokenAddress) => {
    fetchPriceFromJupiterLogger.count++
    try {
        const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAddress}`)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json()
        if (!data.data) return null

        return data.data[tokenAddress].price
    } catch (err) {
        console.error(`Error fetching price from Jupiter for token ${tokenAddress}:`, err)
        return null
    }
}