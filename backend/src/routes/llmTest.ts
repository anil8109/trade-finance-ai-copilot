import { Router } from "express";
import { llm } from "../llm/llmClient";
import { buildTradePrompt } from "../llm/prompts/trade.prompt";
import { TradeAnalysisSchema } from "../llm/schemas/tradeAnalysis.schema";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question, context } = req.body;

  const messages = buildTradePrompt({ question, context });
  const response = await llm.invoke(messages);
  // res.json({ output: response });

  const rawContent =
  typeof response.content === "string"
    ? response.content
    : response.content.map(c => c.text).join("");

  const parsed = JSON.parse(rawContent);
  const validatedResponse = TradeAnalysisSchema.parse(parsed);
  res.json({ output: validatedResponse });
  } catch (err) {
    console.error("LLM test error:", err);
    res.status(500).json({ error: "LLM invocation failed" });
  }
});

export default router;
