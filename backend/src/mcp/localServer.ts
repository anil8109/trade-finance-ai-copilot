import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { allTools } from "./tradeTools";
import { loadTradePolicies } from "../rag/loadPolicies";

const server = new McpServer({
  name: "trade-finance-local",
  version: "1.0.0"
});

// Register your tools
allTools.forEach((tool) => {
  (server as any).tool(
    tool.name,
    tool.description,
    tool.inputSchema.shape as any, // Cast the shape to any
    async (args: any) => {
      const result = await tool.execute(args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
  );
});

async function main() {
  await loadTradePolicies();
  // Use StdioServerTransport for local CLI execution
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Important: Use stderr for logs so they don't break the stdio protocol
  console.error("Trade MCP Server running on stdio...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});