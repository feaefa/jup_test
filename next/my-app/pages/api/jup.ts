// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey, Keypair, clusterApiUrl, LAMPORTS_PER_SOL, Transaction} from '@solana/web3.js'
import fetch from "isomorphic-fetch"

import { Jupiter, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/core'
import {
    ENV,
    INPUT_MINT_ADDRESS,
    OUTPUT_MINT_ADDRESS,
    SOLANA_RPC_ENDPOINT,
    Token,
    USER_KEYPAIR,
  } from "./constants"

type Data = {
  name: string
}

const getPossiblePairsTokenInfo = ({
  tokens,
  routeMap,
  inputToken,
}: {
  tokens: Token[]
  routeMap: Map<string, string[]>
  inputToken?: Token
}) => {
  try {
    if (!inputToken) {
      return {}
    }

    const possiblePairs = inputToken
      ? routeMap.get(inputToken.address) || []
      : [] // return an array of token mints that can be swapped with SOL
    const possiblePairsTokenInfo: { [key: string]: Token | undefined } = {}
    possiblePairs.forEach((address) => {
      possiblePairsTokenInfo[address] = tokens.find((t) => {
        return t.address == address
      })
    })
    // Perform your conditionals here to use other outputToken
    // const alternativeOutputToken = possiblePairsTokenInfo[USDT_MINT_ADDRESS]
    return possiblePairsTokenInfo
  } catch (error) {
    throw error
  }
}

const getRoutes = async ({
  jupiter,
  inputToken,
  outputToken,
  inputAmount,
  slippage,
}: {
  jupiter: Jupiter
  inputToken?: Token
  outputToken?: Token
  inputAmount: number
  slippage: number
}) => {
  try {
    if (!inputToken || !outputToken) {
      return null
    }

    console.log("Getting routes")
    const inputAmountInSmallestUnits = inputToken
      ? Math.round(inputAmount * 10 ** inputToken.decimals)
      : 0
    const routes =
      inputToken && outputToken
        ? (await jupiter.computeRoutes(
          new PublicKey(inputToken.address),
          new PublicKey(outputToken.address),
          inputAmountInSmallestUnits, // raw input amount of tokens
          slippage,
          true
        ))
        : null

    if (routes && routes.routesInfos) {
      console.log("Possible number of routes:", routes.routesInfos.length)
      console.log("Best quote: ", routes.routesInfos[0].outAmount)
      return routes
    } else {
      return null
    }
  } catch (error) {
    throw error
  }
}

const executeSwap = async ({
  jupiter,
  route,
}: {
  jupiter: Jupiter
  route: RouteInfo
}) => {
  try {
    // Prepare execute exchange
    const { execute } = await jupiter.exchange({
      route,
    })
 
    console.log(
      jupiter.setUserPublicKey.toString
    )

    // Execute swap
    const swapResult: any = await execute() // Force any to ignore TS misidentifying SwapResult type

    
    if (swapResult.error) {
      console.log(swapResult.error)
    } else {
      console.log(`https://explorer.solana.com/tx/${swapResult.txid}`)
      console.log(
        `inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`
      )
      console.log(
        `inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`
      )
    }
  } catch (error) {
    console.log(
      "catch error"
    )
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    checkPrice()
    // await checkTransactionSucceeded("jTPhe6v8CJh7CQEh9TnAfR6iHsxuS7TAYUfmkrav2xv4o7ogVK2GQVtP5rFnsePGWc6mhMqBiPtZf9EyxzjHf1v")
    res.status(200).json({ name: 'jup Doe' })
}

// async function fetchData(){
//   const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
//   const USDT_MINT_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
//   const PAI_MINT_ADDRESS = "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"
//   const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112"
//   const BTC_MINT_ADDRESS = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"

//   const connection = new Connection(SOLANA_RPC_ENDPOINT) // Setup Solana RPC connection
//   // const connection = new Connection(clusterApiUrl("mainnet-beta")) // Setup Solana RPC connection
//   const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json() // Fetch token list from Jupiter API

//   //  Load Jupiter
//   const jupiter = await Jupiter.load({
//     connection,
//     cluster: ENV,
//     user: USER_KEYPAIR, // or public key
//   })

//   // console.log(USER_KEYPAIR)
//   // console.log(INPUT_MINT_ADDRESS)
//   // await connection.getBalance(USER_KEYPAIR.publicKey).then(balance => {
//   //   console.log("SOL: ", balance / LAMPORTS_PER_SOL)
//   // })  
//   //  Get routeMap, which maps each tokenMint and their respective tokenMints that are swappable
//   const routeMap = jupiter.getRouteMap()
//   // If you know which input/output pair you want
//   let inputToken = tokens.find((t) => t.address == USDC_MINT_ADDRESS) // USDC Mint Info
//   let outputToken = tokens.find((t) => t.address == SOL_MINT_ADDRESS) // USDT Mint Info
//   // Alternatively, find all possible outputToken based on your inputToken
//   // const possiblePairsTokenInfo = await getPossiblePairsTokenInfo({
//   //   tokens,
//   //   routeMap,
//   //   inputToken,
//   // })

//   const inputAmount = 50 // UI input
//   // const inputTokenInfo = tokens.find(item => item.address === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // Token info

//   // if(inputTokenInfo == undefined) {
//   //   return
//   // }

//   // const amount = inputAmount * (10 ** inputTokenInfo.decimals) // Amount to send to Jupiter

//   const routes = await getRoutes({
//     jupiter,
//     inputToken,
//     outputToken,
//     inputAmount: inputAmount, // 1 unit in UI
//     slippage: 1, // 1% slippage
//   })

//   if(routes == null) {
//     return
//   }

//   console.log("inputToken symbol 1: ", inputToken?.symbol)
//   console.log("inputToken decimals 1: ", inputToken?.decimals)
//   console.log("outputToken symbol 1: ", outputToken?.symbol)
//   console.log("outputToken decimals 1: ", outputToken?.decimals)
//   console.log("inputAmount 1: ", inputAmount)
//   console.log("Best quote 1: ", routes.routesInfos[0].outAmount)

//   inputToken = tokens.find((t) => t.address == SOL_MINT_ADDRESS)
//   outputToken = tokens.find((t) => t.address == USDT_MINT_ADDRESS)

//   if (!inputToken?.decimals){
//     return
//   }
//   const inputAmount2 = routes.routesInfos[0].outAmount / 10 ** inputToken?.decimals

//   const routes2 = await getRoutes({
//     jupiter,
//     inputToken,
//     outputToken,
//     inputAmount: inputAmount2, // 1 unit in UI
//     slippage: 1, // 1% slippage
//   })

//   if(routes2 == null) {
//     return
//   }

//   console.log("inputToken symbol 2: ", inputToken?.symbol)
//   console.log("inputToken decimals 2: ", inputToken?.decimals)
//   console.log("outputToken symbol 2: ", outputToken?.symbol)
//   console.log("outputToken decimals 2: ", outputToken?.decimals)
//   console.log("inputAmount 2: ", inputAmount2)
//   console.log("Best quote 2: ", routes2.routesInfos[0].outAmount)

//   inputToken = tokens.find((t) => t.address == USDT_MINT_ADDRESS)
//   outputToken = tokens.find((t) => t.address == USDC_MINT_ADDRESS)

//   if (!inputToken?.decimals){
//     return
//   }
//   const inputAmount3 = routes2.routesInfos[0].outAmount / 10 ** inputToken?.decimals

//   const routes3 = await getRoutes({
//     jupiter,
//     inputToken,
//     outputToken,
//     inputAmount: inputAmount3, // 1 unit in UI
//     slippage: 1, // 1% slippage
//   })

//   if(routes3 == null) {
//     return
//   }

//   console.log("inputToken symbol 3: ", inputToken?.symbol)
//   console.log("inputToken decimals 3: ", inputToken?.decimals)
//   console.log("outputToken symbol 3: ", outputToken?.symbol)
//   console.log("outputToken decimals 3: ", outputToken?.decimals)
//   console.log("inputAmount 3: ", inputAmount3)
//   console.log("Best quote 3: ", routes3.routesInfos[0].outAmount)

//   // Prepare execute exchange
//   const { transactions } = await jupiter.exchange({
//     route: routes.routesInfos[0],
//   })

//   const { setupTransaction, swapTransaction, cleanupTransaction } = transactions


//   // Execute the transactions
//   // for (let serializedTransaction of [setupTransaction, swapTransaction, cleanupTransaction].filter(Boolean)) {
//   //   // perform the swap
//   //   if(serializedTransaction != undefined){
//   //     const txid = await connection.sendTransaction(serializedTransaction, [USER_KEYPAIR], {
//   //       skipPreflight: true
//   //     })
//   //     await connection.confirmTransaction(txid)
//   //     console.log(`https://solscan.io/tx/${txid}`)
//   //     const isTransactionSucceeded = await checkTransactionSucceeded(txid)
//   //     console.log(`check transaction:${isTransactionSucceeded}`)
//   //     }
//   // }
// }


async function checkPrice(){
  const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  const USDT_MINT_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
  const PAI_MINT_ADDRESS = "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"
  const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112"
  const BTC_MINT_ADDRESS = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"

  const connection = new Connection(SOLANA_RPC_ENDPOINT) // Setup Solana RPC connection
  // const connection = new Connection(clusterApiUrl("mainnet-beta")) // Setup Solana RPC connection
  const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json() // Fetch token list from Jupiter API

  console.log(TOKEN_LIST_URL[ENV])
  console.log(INPUT_MINT_ADDRESS)
  await connection.getBalance(USER_KEYPAIR.publicKey).then(balance => {
    console.log("SOL: ", balance / LAMPORTS_PER_SOL)
  })

  //  Load Jupiter
  const jupiter = await Jupiter.load({
    connection,
    cluster: ENV,
    user: USER_KEYPAIR, // or public key
  })

  // If you know which input/output pair you want
  let inputTokens: (Token | undefined)[] = new Array(3)  ;
  let outputTokens: (Token | undefined)[] = new Array(3)  ;

  
  inputTokens[0] = tokens.find((t) => t.address == USDC_MINT_ADDRESS)
  outputTokens[0] = tokens.find((t) => t.address == SOL_MINT_ADDRESS)
  inputTokens[1] = tokens.find((t) => t.address == SOL_MINT_ADDRESS)
  outputTokens[1] = tokens.find((t) => t.address == USDT_MINT_ADDRESS)
  inputTokens[2] = tokens.find((t) => t.address == USDT_MINT_ADDRESS)
  outputTokens[2] = tokens.find((t) => t.address == USDC_MINT_ADDRESS)

  // let inputAmounts: number[]  = new Array(3);
  let inputAmount = 5

  let routes: ({
    routesInfos: RouteInfo[];
    cached: boolean;
  } | null)[] = new Array(3);

  for (let i = 0; i < 3; i++) {

    routes[i] = await getRoutes({
      jupiter,
      inputToken:inputTokens[i],
      outputToken:outputTokens[i],
      inputAmount, // 1 unit in UI
      slippage: 1, // 1% slippage
    })
    console.log("roop: ", i)
    console.log("inputToken symbol: ", inputTokens[i]?.symbol)
    console.log("outputToken symbol: ", outputTokens[i]?.symbol)
    console.log("inputAmount: ", inputAmount)
    console.log("outputAmount: ", routes[i]?.routesInfos[0].outAmount! / (10 ** outputTokens[i]?.decimals! || 1))
    
    inputAmount = routes[i]?.routesInfos[0].outAmount! / (10 ** outputTokens[i]?.decimals! || 1)
  }  

  console.log("last inputAmount: ", inputAmount)

  if(inputAmount < 5){
    return
  }

  // for (let i = 0; i < 3; i++) {
  //   swap(connection, jupiter, routes[i])
  // }

}

async function swap(connection: Connection, jupiter: Jupiter, routes: {routesInfos: RouteInfo[];cached: boolean;} | null) : Promise<boolean> {

  if(routes == null) {
    return false
  }

  // Prepare execute exchange
  const { transactions } = await jupiter.exchange({
    route: routes.routesInfos[0],
  })

  const { setupTransaction, swapTransaction, cleanupTransaction } = transactions

  // Execute the transactions
  for (let serializedTransaction of [setupTransaction, swapTransaction, cleanupTransaction].filter(Boolean)) {
    // perform the swap
    if(serializedTransaction != undefined){
      const txid = await connection.sendTransaction(serializedTransaction, [USER_KEYPAIR], {
        skipPreflight: true
      })
      // await connection.confirmTransaction(txid)
      console.log(`https://solscan.io/tx/${txid}`)
      // const isTransactionSucceeded = await checkTransactionSucceeded(txid)
      // console.log(`check transaction:${isTransactionSucceeded}`)
      }
  }

  return true
}

async function checkTransactionSucceeded(txid: string) : Promise<boolean> {
  const connection = new Connection(SOLANA_RPC_ENDPOINT) // Setup Solana RPC connection
  const ret = await connection.getTransaction(txid)
  if (!ret) {
    console.log("There is no transaction.")
    return false
  }
  if (!ret?.meta?.err) {
    console.log("transaction succeeded")
    return true
  }

  console.log("transaction failed")
  // console.log(ret)
  // console.log(ret?.meta?.err)
  return false
}
