require('dotenv').config();
import { getTokenFromLLM } from "./LLM/get-token-from-llm";
import { getTweets, TweetsObject } from "./twitter/get-tweets";
import { createSwap } from "./Txn/createSwap";


// const INFLUENCER_USERNAME = [
//     'AltcoinGordon',
//     'realDonaldTrump',
//     'AltcoinPsycho',
// ]

// For  testing
const INFLUENCER_USERNAME = [
    'RabdeepSinghkh1'
]


// Buy a coin
async function main(userNames: string[]) {
    const SPAM_COUNT = 10;
    for(const userName of userNames) {
        const newTweets:TweetsObject[] = await getTweets(userName);
        console.log('newTweets -> ',newTweets);
        for (const tweet of newTweets) {
            const cryptoLLMResponse = await getTokenFromLLM(tweet.content);
            if(cryptoLLMResponse.isBullish && cryptoLLMResponse.contractAddress) {
                console.log('contractAddressResponse -> ',cryptoLLMResponse.contractAddress);
                await createSwap(cryptoLLMResponse.contractAddress);
            }
        }
    }

}

main(INFLUENCER_USERNAME);