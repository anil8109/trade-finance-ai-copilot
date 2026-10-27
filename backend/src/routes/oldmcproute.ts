import { Router } from "express";
import { allTools } from "../mcp/tradeTools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const router = Router();
const server = new McpServer({ name: "trade-finance-copilot", version: "1.0.0" });

// Tool Registration - Standard SDK style
allTools.forEach(tool => {
  server.tool(
    tool.name,
    tool.description,
    tool.inputSchema.shape, // Use .shape for Zod 3 compatibility
    async (args: any) => {
      const result = await tool.execute(args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
});

let transport: any = null;

router.all("/mcp", async (req, res) => {
  if (req.method === "GET") {
    // Fresh session
    transport = new StreamableHTTPServerTransport();
    await server.connect(transport);
    return transport.connect(res);
  } 

  if (req.method === "POST") {
    if (!transport) return res.status(400).send("No active session");
    return transport.handlePostMessage(req, res);
  }
});

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

  try {
    const output = await tool.execute(args);
    res.json(output);
  } catch (err: any) {
    console.error(`MCP Execution Error (${toolName}):`, err);    
    res.status(500).json({ error: err.message });
  }
});

export default router;