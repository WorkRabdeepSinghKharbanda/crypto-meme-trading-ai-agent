# AI Agent Trading Bot on Solana

## Overview

- This project is an AI-powered trading bot that operates on the Solana blockchain. The bot identifies potential trading opportunities by analyzing tweets from a predefined list of crypto influencers who frequently post bullish content about Solana-based tokens.

## Problem Statement
We aim to automate the detection and execution of profitable trades based on influencer tweets. The bot performs the following tasks:
 1. Fetches tweets from a specified list of crypto influencers on Twitter.
 2. Analyzes the tweets using an LLM (Large Language Model) to determine if they are bullish and contain a Solana-based coin contract address.
 3. Once a contract address is identified, the bot proceeds to execute a trade.

### Workflow

1. Fetching & Analyzing Tweets
- The bot monitors tweets from a predefined set of influencers.
- It checks if the influencer posted within the last 10 minutes.
- The tweet is sent to an LLM model for sentiment analysis.
- If identified as a bullish tweet with a contract address, the bot proceeds to the next step.

2. Executing the Transaction
- The bot connects to the Raydium SOL DEX (Decentralized Exchange) to retrieve the current price of the token.
- It then executes a swap transaction to buy the token.
- Using the Solana Mainnet RPC, the bot signs and executes the transaction with the wallet's private key.
- : Currently, the bot only supports buying the token. The implementation for selling the token is in progress.

### Tech Stack

- Blockchain: Solana
- DEX: Raydium
- LLM Processing: AI-based sentiment analysis
- Twitter API: For fetching influencer tweets
- Solana Mainnet RPC: For transaction execution
- Node.js: API call

### Requirements

- Twitter API access
- Solana Wallet & Private Key (recommended: Phantom wallet)
- Raydium DEX integration
- Solana RPC URL (recommended: Alchemy|Helius)
- LLM API for tweet analysis

### Installation

- Clone the repository:
```sh
git clone https://github.com/WorkRabdeepSinghKharbanda/crypto-meme-trading-ai-agent.git
cd crypto-meme-trading-ai-agent
```

- Install dependencies:
```sh
npm install 
```

- Set up environment variables:
check env.example for all env variable used in project
```sh
Twitter API credentials
Solana Wallet Private Key
Solana RPC URL
LLM API key
```

- Running the Bot
```sh
npm run dev
```

### Disclaimer
This bot is for educational purposes only. Trading cryptocurrencies is risky, and automated trading carries additional risks. Use at your own discretion.