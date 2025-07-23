import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const recallGetPrice = createTool({
    id: "recall-get-price",
    description: "Fetches the current spot price for a given token from the Recall Network.",
    inputSchema: z.object({
        tokenAddress: z.string().describe("The full contract address of the token to look up."),
    }),

    outputSchema: z.object({
        price : z.number(),
    }),

    execute: async ({ context }) => {
        const {Recall_API_URL, RECALL_API_KEY} = process.env;
        let params;
        if (context.tokenAddress.startsWith("0x")) {
        params = {
            token: context.tokenAddress,
            chain: 'evm',
            specificChain: 'eth'
        };
        } else {
        params = {
            token: context.tokenAddress,
            chain: 'svm',
            specificChain: 'svm'
        };
        }

        const {data} = await axios.get(`${Recall_API_URL}/api/price`, {
            params: params,
            headers: {Authorization: `Bearer ${RECALL_API_KEY}`},
            timeout: 30_000,
        }
        );
        const price = parseFloat(data.price);
        
        if (isNaN(price)) {
            throw new Error("Invalid price data received from Recall API : " + JSON.stringify(data));
        }
        return {price};
    },

});