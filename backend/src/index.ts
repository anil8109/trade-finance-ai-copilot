import "dotenv/config";
import express from "express";
import cors from 'cors';
import llmTestRoute from "./routes/llmTest";
import auth from "./routes/auth";
import ragTestRoute from './routes/ragTest';
import tradeAnalysis from './routes/tradeAnalysis';
import { loadTradePolicies } from "./rag/loadPolicies";
import mcpRoutes from "./routes/mcpRoutes";
import { generateToken, verifyToken } from './middleware/auth';

const app = express();

console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);

app.use(cors({
  origin: '*', 
  allowedHeaders: ['Content-Type', 'Authorization', 'mcp-session-id'],
  exposedHeaders: ['mcp-session-id']
}));

app.use(express.json());

// 1. Mount MCP FIRST (without express.json)
app.use("/api/auth", auth);
app.use("/api/mcp", verifyToken, mcpRoutes);
app.use("/api/test-llm", verifyToken, llmTestRoute);
app.use("/api/test-rag", verifyToken, ragTestRoute);
app.use("/api/trade", verifyToken, tradeAnalysis);

const PORT = process.env.PORT || 4000;

async function start() {
  await loadTradePolicies();

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

start();