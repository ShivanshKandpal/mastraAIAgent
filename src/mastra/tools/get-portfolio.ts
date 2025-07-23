import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const recallGetPortfolio = createTool({
    id: "recall-get-portfolio",
    description: "Fetches the user's current token balances from the Recall Network.",
    inputSchema: z.object({}),
    outputSchema: z.array(
        z.object({
            token: z.string().describe("ERC-20 address of the token, e.g. USDC"),
            balance: z.string().describe("The amount of the token in human-readable format"),
        })
    ),
    execute: async () => {
        const { RECALL_API_URL, RECALL_API_KEY } = process.env;

        const { data } = await axios.get(`${RECALL_API_URL}/api/agent/balances`, {
            headers: { Authorization: `Bearer ${RECALL_API_KEY}` },
            timeout: 30_000,
        });

        return data;
    },
});