// RAYDIUM EXCHANGE DOCS FOR SWAPING
// https://docs.raydium.io/raydium/traders/trade-api
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import axios from "axios";
// import { connection, owner, fetchTokenAccountData } from '../config'
import { API_URLS } from "@raydium-io/raydium-sdk-v2";
import bs58 from "bs58";

const SOL_AMOUNT = 0.00001 * LAMPORTS_PER_SOL;
const SLIPPAGE = 3;

const connection = new Connection(`${process.env.RPC_URL}`);

const owner = Keypair.fromSecretKey(bs58.decode(`${process.env.PRIVATE_KEY}`));

export async function createSwap(contractAddress: string) {
  // get statistical transaction fee from API
  /**
   * vh: very high
   * h: high
   * m: medium
   */
  const { data } = await axios.get<{
    id: string;
    success: boolean;
    data: { default: { vh: number; h: number; m: number } };
  }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

  //   GETS QUOTE and define swap type
  const { data: swapResponse } = await axios.get(
    `${
      API_URLS.SWAP_HOST
    }/compute/swap-base-in?inputMint=${NATIVE_MINT}&outputMint=${contractAddress}&amount=${SOL_AMOUNT}&slippageBps=${
      SLIPPAGE * 100
    }&txVersion=V0`
  );


  //   Create Transactions
  const { data: swapTransactions } = await axios.post<{
    id: string;
    version: string;
    success: boolean;
    data: { transaction: string }[];
  }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
    computeUnitPriceMicroLamports: String(data.data.default.m),
    swapResponse,
    txVersion: "V0",
    wallet: owner.publicKey.toBase58(),
    wrapSol: true,
    unwrapSol: false,
  });

  //   Deserialize Transactions
  const isV0Tx = true;
  const allTxBuf = swapTransactions.data.map((tx) =>
    Buffer.from(tx.transaction, "base64")
  );
  const allTransactions = allTxBuf.map((txBuf) =>
    isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
  );


  //   Sign and execute Transaction
  if (isV0Tx) {
    let idx = 0;
    for (const tx of allTransactions) {
      idx++;
      const transaction = tx as VersionedTransaction;
      transaction.sign([owner]);
      const txId = await connection.sendTransaction(
        tx as VersionedTransaction,
        { skipPreflight: true }
      );
      const { lastValidBlockHeight, blockhash } =
        await connection.getLatestBlockhash({
          commitment: "finalized",
        });
      console.log(`${idx} transaction sending..., txId: ${txId}`);
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature: txId,
        },
        "confirmed"
      );
      console.log(`${idx} transaction confirmed`);
    }
  }
  console.log(`total ${allTransactions.length} transactions`, swapTransactions);
}
