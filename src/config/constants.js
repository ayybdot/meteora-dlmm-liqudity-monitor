import { PublicKey } from "@solana/web3.js";

export const MeteoraDlmmProgram = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")

export const TokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

export const MetadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

export const SIGNATURE_CACHE_SIZE = 100
export const METADATA_BUFFER_RANGES = {
    NAME: { start: 66, end: 101 },
    SYMBOL: { start: 102, end: 115 },
    URI: { start: 116, end: 319 }
}

export const LOG_INTERVAL = 10000 // 10 seconds

export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000;