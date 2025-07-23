import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const researchAssistant = createTool({
    id: "news-researchTopic",
    description: "Performs targeted research on a topic by searching for relevant news articles. It returns a list containing the title and description of each article for deep analysis.",
  
    inputSchema: z.object({
    // The query can now be a full question
    query: z.string().describe("A specific, targeted search query or question, e.g., 'Ethereum price projection,'"),
     }),
    outputSchema: z.object({
    articles: z.array(z.object({
        title: z.string(),
        description: z.string(),
    })),
     }),    
    execute : async ({context}) => {
        const {NEWS_API_URL, NEWS_API_KEY} = process.env;

        if(!NEWS_API_URL || !NEWS_API_KEY) {
            throw new Error("NEWS_API_URL or NEWS_API_KEY is not set in environment variables");
        }
        
        try {
            const response = await axios.get(`${NEWS_API_URL}/everything`, {
                params: {
                    q: context.query,
                    pageSize: 5,
                    apiKey: NEWS_API_KEY,
                    sortBy: "relevancy",
                },
            }
        );
        const responseArticles = response.data.articles;
        if (!responseArticles || responseArticles.length === 0) {
            return { articles: [] };
        }
        const articles = responseArticles.map((article: any) => ({
            title: article.title || "", // Ensure title is not null
            description: article.description || "No description available.", // Handle null descriptions
        }));
        console.log(`[news-researchTopic] Fetched ${articles.length} articles for query: "${context.query}"`);
        // console.log(`[news-getSentiment] Analyzed ${articles.length} headlines. Average score: ${averageScore.toFixed(4)}`);
        return {articles};

        }catch (error:any) {
            console.error("Error fetching news articles:", error);
            return {articles: []};
        }
    },
});