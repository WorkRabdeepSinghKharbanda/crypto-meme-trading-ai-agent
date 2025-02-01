import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function getTokenFromLLM(content: string) {
  const stream = await openai.chat.completions.create({
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
  
  const response = stream?.choices?.[0]?.message?.content
    ? JSON.parse(stream?.choices?.[0]?.message?.content)
    : { isBullish: false, contractAddress: "" };
  return response;
}
