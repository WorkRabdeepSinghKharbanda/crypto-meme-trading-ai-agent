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
exports.getTokenFromLLM = getTokenFromLLM;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const ai_model_to_check_if_tweet_is_bull_post = `
    You are an AI agent specialized in analyzing tweets related to cryptocurrencies. Your task is to determine if a given tweet is "bullish" or "not bullish" in sentiment, and to extract any cryptocurrency contract address if mentioned. 
        - If the tweet expresses a positive outlook, with an expectation of price increase or growth for any cryptocurrency, return "isBullish: true" and the contract address if available.
        - If the tweet expresses a neutral, negative, or cautious sentiment, return "isBullish: false" and an empty string for the contract address.
        - If no contract address is found in the tweet, return an empty string for the address.
        
        A tweet is considered bullish if it contains positive phrases such as:
        - "to the moon"
        - "skyrocketing"
        - "huge potential"
        - "undervalued"
        - "breaking all-time highs"
        
        Non-bullish tweets might include phrases like:
        - "declining"
        - "underperforming"
        - "too risky"
        - "waiting for recovery"
        
        Ensure to extract only valid SOL cryptocurrency contract address mentioned, and not any other crypto chain apart from Solana chain .Check for only sol based contract address .
        Return the response in JSON format for eg -
        
        {
            isBullish: true,
            contractAddress: "0x1234567890abcdef"
        }
`;
function getTokenFromLLM(content) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const stream = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: ai_model_to_check_if_tweet_is_bull_post },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this tweet and determine if it's a bullish post. here is the tweet: ${content}`,
                        },
                    ],
                },
            ],
        });
        const response = ((_c = (_b = (_a = stream === null || stream === void 0 ? void 0 : stream.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content)
            ? JSON.parse((_f = (_e = (_d = stream === null || stream === void 0 ? void 0 : stream.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.content)
            : { isBullish: false, contractAddress: "" };
        return response;
    });
}
