import { Router } from "express";
import { allTools } from "../mcp/tradeTools";

const router = Router();

router.get("/tools", (req, res) => {
  res.json({
    tools: allTools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }))
  });
});

router.post("/execute", async (req, res) => {    
  const { toolName, arguments: args } = req.body;
  const tool = allTools.find(t => t.name === toolName);
  
  if (!tool) return res.status(404).json({ error: "Tool not found" });

  // 1. Check if args exist
  if (!args) {
    return res.status(400).json({ error: "No arguments provided." });
  }

  // 2. KEY VALIDATION: Ensure the tool gets the specific key it needs
  if (toolName === "query_trade_policies" && !args.query) {
    return res.status(400).json({ error: "The Search tool requires a 'query' argument." });
  }
  
  if (toolName === "analyze_trade_case" && !args.tradeCaseText) {
    return res.status(400).json({ error: "The Analysis tool requires 'tradeCaseText' argument." });
  }

  try {
    // Set a 10-second timeout so it NEVER stays stuck
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), 10000)
    );

    const output = await Promise.race([tool.execute(args), timeout]);
    res.json(output);
  } catch (err: any) {
    console.error("Execution failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;