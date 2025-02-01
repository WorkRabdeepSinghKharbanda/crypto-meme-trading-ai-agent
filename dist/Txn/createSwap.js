"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwap = createSwap;
// RAYDIUM EXCHANGE DOCS FOR SWAPING
// https://docs.raydium.io/raydium/traders/trade-api
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const axios_1 = __importDefault(require("axios"));
// import { connection, owner, fetchTokenAccountData } from '../config'
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const bs58_1 = __importDefault(require("bs58"));
const SOL_AMOUNT = 0.00001 * web3_js_1.LAMPORTS_PER_SOL;
const SLIPPAGE = 3;
const connection = new web3_js_1.Connection(`${process.env.RPC_URL}`);
const owner = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(`${process.env.PRIVATE_KEY}`));
function createSwap(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // get statistical transaction fee from API
        /**
         * vh: very high
         * h: high
         * m: medium
         */
        const { data } = yield axios_1.default.get(`${raydium_sdk_v2_1.API_URLS.BASE_HOST}${raydium_sdk_v2_1.API_URLS.PRIORITY_FEE}`);
        //   GETS QUOTE and define swap type
        const { data: swapResponse } = yield axios_1.default.get(`${raydium_sdk_v2_1.API_URLS.SWAP_HOST}/compute/swap-base-in?inputMint=${spl_token_1.NATIVE_MINT}&outputMint=${contractAddress}&amount=${SOL_AMOUNT}&slippageBps=${SLIPPAGE * 100}&txVersion=V0`);
        //   Create Transactions
        const { data: swapTransactions } = yield axios_1.default.post(`${raydium_sdk_v2_1.API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
            computeUnitPriceMicroLamports: String(data.data.default.m),
            swapResponse,
            txVersion: "V0",
            wallet: owner.publicKey.toBase58(),
            wrapSol: true,
            unwrapSol: false,
        });
        //   Deserialize Transactions
        const isV0Tx = true;
        const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, "base64"));
        const allTransactions = allTxBuf.map((txBuf) => isV0Tx ? web3_js_2.VersionedTransaction.deserialize(txBuf) : web3_js_2.Transaction.from(txBuf));
        //   Sign and execute Transaction
        if (isV0Tx) {
            let idx = 0;
            for (const tx of allTransactions) {
                idx++;
                const transaction = tx;
                transaction.sign([owner]);
                const txId = yield connection.sendTransaction(tx, { skipPreflight: true });
                const { lastValidBlockHeight, blockhash } = yield connection.getLatestBlockhash({
                    commitment: "finalized",
                });
                console.log(`${idx} transaction sending..., txId: ${txId}`);
                yield connection.confirmTransaction({
                    blockhash,
                    lastValidBlockHeight,
                    signature: txId,
                }, "confirmed");
                console.log(`${idx} transaction confirmed`);
            }
        }
        console.log(`total ${allTransactions.length} transactions`, swapTransactions);
    });
}
