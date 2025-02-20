import "dotenv/config"
import { monitorLiquidity } from "./services/monitor.js"

async function main() {
    try {
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);

        console.log('Starting Liquidity Monitoring...');
        await monitorLiquidity();
    } catch (error) {
        console.error('Critical error:', error);
        process.exit(1);
    }
}

function gracefulShutdown() {
    console.log('Exiting...');
    process.exit(0);
}

main();