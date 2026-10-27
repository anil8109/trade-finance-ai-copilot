import { Router } from "express";
import { llm } from "../llm/llmClient";
import { buildTradePrompt } from "../llm/prompts/trade.prompt";
import { getRelevantTradePolicies } from "../rag/retriever";
import { TradeAnalysisSchema } from "../llm/schemas/tradeAnalysis.schema";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    // 1. FETCH context from FAISS (The RAG part)
    const retrievedContext = await getRelevantTradePolicies(question);

    console.log('contect from faiss: ', retrievedContext);
    
    // 2. BUILD prompt with the retrieved context
        const messages = buildTradePrompt({ 
        question, 
        context: retrievedContext 
        });

        // 3. CALL LLM
        const response = await llm.invoke(messages);
        
    const rawContent = typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

    // 4. VALIDATE & RESPOND
    const parsed = JSON.parse(rawContent);
    const validatedResponse = TradeAnalysisSchema.parse(parsed);

    res.json({ 
      output: validatedResponse,
      sourcesUsed: retrievedContext // To show the user which policies were hit
    });
  } catch (err) {
    console.error("RAG Test Error:", err);
    res.status(500).json({ error: "RAG flow failed" });
  }
});

export default router;