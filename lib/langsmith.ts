// lib/langsmith.ts
import { Client } from "langsmith";

export const lsClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY!,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com",
});
