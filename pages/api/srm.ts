import type { NextApiRequest, NextApiResponse } from 'next'
import { Account, Connection, PublicKey, Cluster, Keypair } from '@solana/web3.js'
import { Market } from '@project-serum/serum'

// Endpoints, connection
export const ENV: Cluster = (process.env.cluster as Cluster) || "mainnet-beta"
export const SOLANA_RPC_ENDPOINT = ENV === "devnet"
    ? 'https://api.devnet.solana.com'
    : "https://solana-api.projectserum.com"

// export const USER_KEYPAIR = Keypair.fromSecretKey(  Uint8Array.from([]))

class MarketPlayer {
  connection: Connection
  baseToken: string
  quoteToken: string
  marketName: string
  market: Market | null
  bid:number | null
  ask:number | null
 
  constructor(connection:Connection, marketName:string) {
    this.connection = connection
    this.baseToken = marketName.split("/", 2)[0] 
    this.quoteToken = marketName.split("/", 2)[1]
    this.marketName = marketName
    this.market = null
    this.bid = null
    this.ask = null
  }

  async initMarket() {
    const marketsJson = await (await fetch("https://raw.githubusercontent.com/project-serum/serum-ts/master/packages/serum/src/markets.json")).json()
    this.market = await fetchMarket(this.connection, this.marketName, marketsJson)
  }

  async updatePrice() {
    this.bid = await fetchBid(this.connection, this.market!)
    this.ask = await fetchAsk(this.connection, this.market!)  
  }
}

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const tokens = ['USDT', 'SRM', 'BTC']
  const tokens2 = ['USDT', 'SRM', 'SOL']
  startCheck(tokens)
  startCheck(tokens2)
 
  res.status(200).json({ name: 'John Doe' })
}

async function startCheck(tokens:string[]) {
  const connection = new Connection(SOLANA_RPC_ENDPOINT) // Setup Solana RPC connection
 
  const marketMap: Record<string, MarketPlayer> = {}

  const marketsJson = await (await fetch("https://raw.githubusercontent.com/project-serum/serum-ts/master/packages/serum/src/markets.json")).json()
  const marketNames = getMarketNames(marketsJson)
  const pairNames = getPairNames(marketNames, tokens)

  console.log(pairNames)

  if(pairNames.length != tokens.length) {
    console.log("there is no pair")
    return
  }

  for (const { i, name } of pairNames.map((name, i) => ({ i, name }))) {
    marketMap[name] = new MarketPlayer(connection, name)
    await marketMap[name]!.initMarket()
  }

  const commonBaseToken = getCommonBaseToken(pairNames)
  const commonQuoteToken = getCommonQuoteToken(pairNames)
  const other = tokens.filter(e => (e != commonBaseToken && e != commonQuoteToken) )[0]
  console.log("base :",commonBaseToken)
  console.log("quote:",commonQuoteToken)
  console.log("other:",other)

  const baseQuote = commonBaseToken + "/" + commonQuoteToken
  const baseOther = commonBaseToken + "/" + other
  const otherQuote = other + "/" + commonQuoteToken

  for (let key in marketMap) {
    await marketMap[key].updatePrice()
    // console.log(key, marketMap[key].baseToken);
    // console.log(key, marketMap[key].quoteToken);
    console.log(key, marketMap[key].bid);
    console.log(key, marketMap[key].ask);
  }

  console.log("baseQuote :",baseQuote)
  console.log("otherQuote:",otherQuote)
  console.log("baseOther :",baseOther)

  let rootA = 1*marketMap[baseQuote].bid!/marketMap[otherQuote].ask!/marketMap[baseOther].ask!
  let rootB = 1/marketMap[baseQuote].ask!*marketMap[otherQuote].bid!*marketMap[baseOther].bid!
  console.log(rootA, rootB);

}

function getMarketNames(marketsJson: any[] ) : string[] {

  const maketNames = marketsJson.filter(e => e.deprecated == false).map(x => x.name)
  
  return maketNames
}

function getPairNames(marketNames: string[], tokens: string[] ) : string[] {

  const allPairs = tokens.flatMap(d => tokens.map(v => d + "/" + v))
  const pairNames = marketNames.filter(marketName => allPairs.some(pairName => marketName === pairName));
  return pairNames
}

function getCommonBaseToken(pairNames: string[] ) : string {
  let commonBaseToken = ""
  for (let i = 0; i < pairNames.length; i++) {
    let checkToken = pairNames[i].split("/", 2)[0] 
      for (let j = 0; j < pairNames.length; j++) {
        if(i === j) {
          continue
        }
        if (checkToken === pairNames[j].split("/", 2)[0]){
          commonBaseToken =  pairNames[j].split("/", 2)[0]
        }
      }
  }

  return commonBaseToken
}

function getCommonQuoteToken(pairNames: string[] ) : string {
  let commonQuoteToken = ""
  for (let i = 0; i < pairNames.length; i++) {
    let checkToken = pairNames[i].split("/", 2)[1] 
      for (let j = 0; j < pairNames.length; j++) {
        if(i === j) {
          continue
        }
        if (checkToken === pairNames[j].split("/", 2)[1]){
          commonQuoteToken =  pairNames[j].split("/", 2)[1]
        }
      }
  }

  return commonQuoteToken
}

async function fetchMarket(connection:Connection, name: string, marketsJson: any[] ) : Promise<Market> {
 
  let marketAddress = new PublicKey(marketsJson.filter(e => e.name == name && e.deprecated == false)[0].address)
  let programAddress = new PublicKey(marketsJson.filter(e => e.name == name && e.deprecated == false)[0].programId)
  let market = await Market.load(connection, marketAddress, {}, programAddress)
  
  return market
}

async function fetchBid(connection:Connection, market: Market ) : Promise<number> {
  // Fetching orderbooks
  const bids = await market.loadBids(connection)
  return bids.getL2(1)[0][0]
}

async function fetchAsk(connection:Connection, market: Market ) : Promise<number> {
  // Fetching orderbooks
  const asks = await market.loadAsks(connection)
  return asks.getL2(1)[0][0]
}

function precisionRound(number: number, precision: number) : number {
  if (precision < 0)
  {
    let factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }
  else
    return +(Math.round(Number(number + "e+" + precision)) +
      "e-" + precision)
}

  // let tickSize = market.tickSize
  // let minOrderSize = market.minOrderSize

  // return {bid, ask, tickSize, minOrderSize}
  // L2 orderbook data
//   for (let [price, size] of bids.getL2(3)) {
//     console.log(price, size)
//   }
//   for (let [price, size] of asks.getL2(3)) {
//     console.log(price, size)
//   }

  // Placing orders
  // let owner = new Account(USER_KEYPAIR.secretKey)
  // let payer = new PublicKey("GjeQuKbFBZCdEqvBcJRgFV97mrep1FepQUtHEnywhWqz") // spl-token account

  // Retrieving open orders by owner
//   let myOrders = await market.loadOrdersForOwner(connection, owner.publicKey)
//   console.log(myOrders)

  // await market.placeOrder(connection, {
  //   owner,
  //   payer,
  //   side: 'sell', // 'buy' or 'sell'
  //   price: sell_price,
  //   size: 1.0,
  //   orderType: 'limit', // 'limit', 'ioc', 'postOnly'
  // })

// }