import {MCPClient} from '@mastra/mcp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const mcp = new MCPClient({
    servers: {
        r: {
            command: "node",
            args: [
                path.resolve(__dirname, "../../../js-recall/packages/api-mcp/dist/index.js")
            ],
            env: {
                "API_KEY": process.env.RECALL_API_KEY || "",
                "API_SERVER_URL": process.env.RECALL_API_URL || "https://api.sandbox.competitions.recall.network",
                "RECALL_API_KEY": process.env.RECALL_API_KEY || "",
                "RECALL_API_URL": process.env.RECALL_API_URL || "https://api.sandbox.competitions.recall.network",
                "WALLET_PRIVATE_KEY": process.env.WALLET_PRIVATE_KEY || "",
                "LOG_LEVEL": "info",
            },
        },
    },
});