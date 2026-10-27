import { z } from "zod";
import { TradeTool } from "./type";

const analyzeTradeSchema = z.object({
  tradeId: z.string(),
});

export const analyzeTradeTool: TradeTool<typeof analyzeTradeSchema> = {
  name: "analyzeTrade",
  description: "Analyze a trade case",
  inputSchema: analyzeTradeSchema,

  execute: async (args) => {
    // ✅ Now args is fully typed
    return { message: `Analyzed ${args.tradeId}` };
  },
};

export const allTools = [
  analyzeTradeTool,
];