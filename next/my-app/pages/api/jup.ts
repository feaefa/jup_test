// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/core'
import {
    ENV,
    INPUT_MINT_ADDRESS,
    OUTPUT_MINT_ADDRESS,
    SOLANA_RPC_ENDPOINT,
    Token,
    USER_KEYPAIR,
  } from "./constants";

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    await fetchData();
    res.status(200).json({ name: 'jup Doe' })
}

async function fetchData(){
    const SOLANA_RPC_ENDPOINT = "https://solana-api.projectserum.com";
    const connection = new Connection(SOLANA_RPC_ENDPOINT); 

    const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json(); 
    console.log(tokens);
}