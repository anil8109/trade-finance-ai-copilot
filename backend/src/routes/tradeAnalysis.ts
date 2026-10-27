import { Router } from "express";
import { tradeGraph } from "../agents/graph";

const router = Router();

router.post("/analyze", async (req, res) => {
  try {
    const { tradeCaseText } = req.body;

    // Start the Multi-Agent Workflow
    const initialState = { input: tradeCaseText };
    const finalState = await tradeGraph.invoke(initialState);

    // Return the final output produced by the Risk Agent
    // res.json(finalState.finalResult);
    // Return BOTH the risk assessment AND the memo
    res.json({
      analysis: finalState.finalResult,
      escalationMemo: finalState.escalationMemo || null // This will be null for LOW risk
    });
  } catch (err) {
    console.error("Agent Workflow Error:", err);
    res.status(500).json({ error: "Multi-agent analysis failed" });
  }
});

export default router;