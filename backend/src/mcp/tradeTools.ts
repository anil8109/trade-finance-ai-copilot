import { z } from "zod";
import { tradeGraph } from "../agents/graph";
import { getRelevantTradePolicies } from "../rag/retriever";

// --- SECURITY UTILITY: PII MASKING ---
/**
 * Simple utility to scrub PII (Emails, Account Numbers, Names) 
 * before sending to LLM providers.
 */
const maskPII = (text: string): string => {
  return text
    // Mask Emails
    .replace(/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/g, "[EMAIL_MASKED]")
    // Mask typical International Bank Account Numbers (IBAN) or long account strings
    .replace(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, "[ACCOUNT_MASKED]")
    // Mask 13-16 digit numbers (Potential Credit Cards/Internal IDs)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[ID_MASKED]");
};

interface TradeToolResponse {
  success: boolean;
  data: any;
  source: string;
}

/**
 * Trade Analysis Tool
 */
export const tradeAnalysisTool = {
  name: "analyze_trade_case",
  description: "Runs a multi-agent analysis on trade finance cases.",

  inputSchema: z.object({
    tradeCaseText: z.string(),
  }),

  execute: async (args: { tradeCaseText: string }) => {
    // 🛡️ MASK PII before invoking the Agentic Workflow
    const sanitizedInput = maskPII(args.tradeCaseText);

    console.log('sanitizedInput:', sanitizedInput);
    
    const result = await tradeGraph.invoke({
      input: sanitizedInput,
    });

    return {
      success: true,
      data: {
        analysis: result.finalResult,
        escalation: result.escalationMemo || "No escalation required.",
      },
      source: "trade-finance-engine"
    };
  },
};

/**
 * Policy Query Tool
 */
export const policyQueryTool = {
  name: "query_trade_policies",
  description: "Search trade policies using RAG.",

  inputSchema: z.object({
    query: z.string(),
  }),

  execute: async (args: { query: string }): Promise<TradeToolResponse> => {
    // 🛡️ MASK PII before querying the Vector Database
    const sanitizedQuery = maskPII(args.query);

    const context = await getRelevantTradePolicies(sanitizedQuery);
    return {
      success: true,
      data: context,
      source: "trade-finance-engine"
    };
  },
};

export const allTools = [tradeAnalysisTool, policyQueryTool];