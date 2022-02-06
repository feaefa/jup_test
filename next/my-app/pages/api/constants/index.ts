import { Cluster } from "@solana/web3.js";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

require('dotenv').config()

// Endpoints, connection
export const ENV: Cluster = (process.env.cluster as Cluster) || "mainnet-beta";
export const SOLANA_RPC_ENDPOINT = ENV === "devnet"
    ? 'https://api.devnet.solana.com'
    : "https://solana-api.projectserum.com";

// Wallets
// export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "PASTE YOUR WALLET PRIVATE KEY";
// export const USER_PRIVATE_KEY = bs58.decode(WALLET_PRIVATE_KEY);
// export const USER_KEYPAIR = Keypair.fromSecretKey(USER_PRIVATE_KEY);
export const USER_KEYPAIR = Keypair.fromSecretKey(  Uint8Array.from([25,75,48,118,67,51,155,246,110,226,123,43,77,216,76,104,20,34,130,185,211,191,93,177,58,252,224,52,166,80,179,55,202,79,38,44,192,102,178,14,47,106,12,105,82,139,176,11,129,217,120,46,249,14,98,121,158,13,241,193,205,22,131,12]));

// Token Mints
export const INPUT_MINT_ADDRESS =
    ENV === "devnet"
        ? "So11111111111111111111111111111111111111112" // SOL
        : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
export const OUTPUT_MINT_ADDRESS = ENV === "devnet"
    ? "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" // SRM
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT

// Interface
export interface Token {
    chainId: number; // 101,
    address: string; // '8f9s1sUmzUbVZMoMh6bufMueYH1u4BJSM57RCEvuVmFp',
    symbol: string; // 'TRUE',
    name: string; // 'TrueSight',
    decimals: number; // 9,
    logoURI: string; // 'https://i.ibb.co/pKTWrwP/true.jpg',
    tags: string[]; // [ 'utility-token', 'capital-token' ]
}