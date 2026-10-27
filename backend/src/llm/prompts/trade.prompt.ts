// src/llm/prompts/trade.prompt.ts

import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { TRADE_GUARDRAIL_SYSTEM_PROMPT } from "./guardrail.system";

interface TradePromptInput {
  question: string;
  context?: string;
}

export function buildTradePrompt({
  question,
  context,
}: TradePromptInput) {
  const userContent = `
Context:
${context && context.trim().length > 0 ? context : "No additional context provided."}

User Question:
${question}
`;

  return [
    new SystemMessage(TRADE_GUARDRAIL_SYSTEM_PROMPT),
    new HumanMessage(userContent),
  ];
}
