import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const GetRecentPrices = createTool({
  id: "coingecko-get-recent-prices",
  description: "Fetches the last 24 hours of high-frequency price data for a specific cryptocurrency from CoinGecko.",
  
  inputSchema: z.object({
    coinId: z.string().describe("The CoinGecko API ID of the coin, e.g., 'ethereum' or 'bitcoin'."),
  }),

  // --- THE SCHEMA FIX IS HERE ---
  // We change the array of tuples to an array of objects.
  outputSchema: z.object({
    pricePoints: z.array(
      z.object({
        timestamp: z.number().describe("The UNIX timestamp in milliseconds."),
        price: z.number().describe("The price in USD at that time."),
      })
    ).describe("An array of price point objects for the last 24 hours."),
  }),
  // --- END OF SCHEMA FIX ---

  execute: async ({ context }) => {
    const { coinId } = context;

    console.log(`[Tool] Fetching 24-hour price data for '${coinId}' from CoinGecko...`);
    const coingeckoUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    
    try {
      const response = await axios.get(coingeckoUrl);
      const prices = response.data.prices as [number, number][]; // Assert the type for safety
      
      if (!prices || prices.length === 0) {
        throw new Error("No price data returned from CoinGecko.");
      }
      
      // --- THE RETURN VALUE FIX IS HERE ---
      // We must transform the API's array-of-arrays into our new array-of-objects
      // to match the updated outputSchema.
      const pricePoints = prices.map(priceEntry => ({
        timestamp: priceEntry[0],
        price: priceEntry[1],
      }));
      // --- END OF RETURN VALUE FIX ---
      
      console.log(`[Tool] Successfully fetched and formatted ${pricePoints.length} price points.`);
      
      return { pricePoints }; // Return the newly formatted data

    } catch (error: any) {
      console.error("❌ Error fetching data from CoinGecko:", error.message);
      return { pricePoints: [] };
    }
  },
});