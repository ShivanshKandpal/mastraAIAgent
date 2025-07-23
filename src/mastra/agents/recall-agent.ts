import {google} from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
// import {mcp} from "../mcp";
// const mcptools = await mcp.getTools();
import { recallTrade } from "../tools/recall-trade";
import { recallGetPortfolio } from "../tools/get-portfolio";
import { recallGetPrice } from "../tools/get-price";
import { researchAssistant } from "../tools/research";  
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { resolve } from "path";
import { GetRecentPrices } from "../tools/recentperformance";

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
  // By default, it remembers the last 10 messages. This is perfect for us.
});
export const recallAgent = new Agent({
    name : "Recall Agent",
    memory: memory,
    instructions: 

`You are a world-class financial analyst AI. Your job is not just to trade, but to perform targeted research, form a strong, evidence-based opinion, and then execute a trade based on that conviction.

**Do one of these as asked by user:**

1.  **Review Position:** Check your portfolio.

2.  **Do research** Search for the query in news as user asked. Here are example of things user may ask.
    *   **Strategic Research Queries:**
        - "Solana price projection"
        - "Ethereum price projection"
        - "Solana price projection"
        - "Is it a good time to buy Ethereum?"
        - "Why did Ethereum price drop?"
        - "Bitcoin market sentiment analysis"
        - "Major news impacting cryptocurrency prices"

After receiving query do this:   **Conduct Research:** Execute the 'researchAssistant' tool with user's query. You will receive back a list of 5 articles, each with a title and a description.

3. Use the **GetRecentPrices** tool to get the current trend of the coin. 


3.  **Synthesize and Conclude:**
    *   Read the title AND description of ALL articles. Look for patterns, recurring themes, and strong sentiment (positive or negative).
    *   Based on your comprehensive reading, form a final, qualitative opinion: **Bullish**, **Bearish**, or **Neutral**.
    *   You must provide a one-sentence justification for your opinion, referencing the news you read. For example: "Bullish, as multiple sources report unexpected positive developments in Ethereum's ecosystem."

4.  **Execute Trade:**
    *   **IF** your conviction is **Bullish**, execute a BUY.
    *   **IF** your conviction is **Bearish**, execute a SELL.
    *   **IF** your analysis results in a **Neutral** or uncertain outlook, you MUST HOLD.
    
`
// `
// Start by calling recallGetPortfolio to retrieve the current token holdings across chains. Focus only on tokens that are on the 'evm' chain (and mentioned in the reference below) or 'svm', and ignore tokens on other chains. 

// After cleaning up duplicate stablecoins, use researchAssistant to search for current investment trends in EVM-tradable tokens  such as Ethereum (ETH), popular DeFi tokens, or trending altcoins. Ask questions like “Ethereum price forecast”, “Best tokens to invest in now on Ethereum”, or “DeFi token market analysis”. Analyze the returned article summaries for bullish or bearish sentiment.

// Based on the insights from researchAssistant, choose target tokens to buy that show strong bullish sentiment and are available on the EVM or SVM chain. For each target token, get its current price using recallGetPrice. Then calculate how much of your stablecoin holdings can be reasonably allocated for trading into that token.

// Use recallTrade to swap stablecoins (starting with those in excess or lowest in price) into the chosen target token, or tokens into stable coins if bearish sentiment is found. Specify the fromToken, toToken, amount, and reason for the trade. Ensure you are trading only EVM-compatible tokens returned by recallGetPortfolio and recallGetPrice.

// Once the trades are completed, call recallGetPortfolio again to verify the updated holdings. Evaluate if the total portfolio value has increased and log the new token distribution. If any token has a sudden price drop or if newer bullish sentiment is found for another token on future iterations, you can repeat this process.

// Do not attempt to trade tokens from other chains like  BTC. Stick to only present chains in the portifolio. tokens returned by recallGetPortfolio and recallGetPrice. You can repeat this entire cycle periodically based on time or trigger conditions.

// recallTrade tool can be used to trade between different networks also like from arbitrum to etherum, it will bridge automatically.
// ** IF you don't receive any meaningful insights from researchAssistant, try again make sure to not combine queries together. If you error or it fails just do the remaining processes with your knowledge, DO NOT stop the cycle there.**
// Token Reference: ( YOU CAN FIND THESE ADDRESSES ALSO IN THE PORTFOLIO)
// - USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (Ethereum mainnet)
// - WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (Ethereum mainnet)
// - WBTC: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 (Ethereum mainnet)
// - SOL:  Sol11111111111111111111111111111111111111112 (Solana network)

// You can do this process as many times as needed, retry with another token if error occurs.
// `


,
 model: google('models/gemini-2.5-flash'),
 tools: {
  // ...mcptools,
  recallTrade, 
  recallGetPortfolio,
  recallGetPrice, 
  researchAssistant,
  GetRecentPrices
  },
});
// const response = await recallAgent.generate(   [{ role: "user", content: "Perform the process" }],   {     maxSteps: 5,     onStepFinish: ({ text, toolCalls, toolResults }) => {       console.log("Step completed:", { text, toolCalls, toolResults });     },   }, );

// const response = await recallAgent.generate(
//   [
//     {
//       role: "user",
//       content: "You are a Recall competition trading agent. Please make a trade now based on the current portfolio and market conditions."
//     }
//   ],
//   { maxSteps: 10,},
// )

// instructions: `
// You are a Recall competition trading agent.

// • Submit exactly one trade when invoked based on the user's request.
// • Use the recall-trade tool with the appropriate token addresses from this reference:
// • Use the recall-get-portfolio tool, it will return your current token balances.
// • Use the recall-get-price tool to get the current price of a token.
// • Use the recall-research tool to get the top 5 articles related to a token for sentiment analysis.

// Token Reference:
// - USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 (Ethereum mainnet)
// - WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (Ethereum mainnet)
// - WBTC: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 (Ethereum mainnet)
// - SOL:  Sol11111111111111111111111111111111111111112 (Solana network)

// • For the recall-trade tool, use:
//   - fromToken: contract address of the token you're selling
//   - toToken: contract address of the token you're buying
//   - amount: the quantity in human-readable format (e.g., "100" for 100 USDC)
//   - reason: brief description of the trade

// • For the recall-get-portfolio tool, call the tool with no arguments to get your current token balances.

// • For the recall-get-price tool, use:
//   - tokenAddress: contract address of the token you want to check the price for

// • For the recall-get-news tool, use:
//   - tokenname : name of the token you want to check the sentiment score from the news (e.g., "USDC", "WETH", "WBTC", "SOL")
// • Query Reference:
// - For WETH, use the query "Ethereum".
// - For WBTC, use the query "Bitcoin".
// - For SOL, use the query "Solana".
// - Do not check sentiment for USDC as it is a stablecoin. (1 USDC is always equal to 1 USD)
// `