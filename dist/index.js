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
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const get_token_from_llm_1 = require("./LLM/get-token-from-llm");
const get_tweets_1 = require("./twitter/get-tweets");
const createSwap_1 = require("./Txn/createSwap");
// const INFLUENCER_USERNAME = [
//     'AltcoinGordon',
//     'realDonaldTrump',
//     'AltcoinPsycho',
// ]
// For  testing
const INFLUENCER_USERNAME = [
    'RabdeepSinghkh1'
];
// Buy a coin
function main(userNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const SPAM_COUNT = 10;
        for (const userName of userNames) {
            const newTweets = yield (0, get_tweets_1.getTweets)(userName);
            console.log('newTweets -> ', newTweets);
            for (const tweet of newTweets) {
                const cryptoLLMResponse = yield (0, get_token_from_llm_1.getTokenFromLLM)(tweet.content);
                if (cryptoLLMResponse.isBullish && cryptoLLMResponse.contractAddress) {
                    console.log('contractAddressResponse -> ', cryptoLLMResponse.contractAddress);
                    yield (0, createSwap_1.createSwap)(cryptoLLMResponse.contractAddress);
                }
            }
        }
    });
}
main(INFLUENCER_USERNAME);
