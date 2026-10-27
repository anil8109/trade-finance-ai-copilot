import { TradeState } from "./state";
import { llm } from "../llm/llmClient";
import { getRelevantTradePolicies } from "../rag/retriever";
import { TradeAnalysisSchema } from "../llm/schemas/tradeAnalysis.schema";
import { buildTradePrompt } from "../llm/prompts/trade.prompt";

// 1. Parsing Agent: Cleans raw text into a standard structure
export async function parsingAgent(state: typeof TradeState.State) {
  console.log("--- Parsing Agent Working ---");
  const response = await llm.invoke(`Standardize this trade case into JSON: ${state.input}`);
  return { parsedData: response.content };
}

// 2. Compliance Agent: Runs RAG and checks for issues
export async function complianceAgent(state: typeof TradeState.State) {
  console.log("--- Compliance Agent Working ---");
  // Use our RAG retriever from Phase 4!
  const context = await getRelevantTradePolicies(JSON.stringify(state.parsedData));
  
  const response = await llm.invoke(`
    Context: ${context}
    Trade Data: ${JSON.stringify(state.parsedData)}
    List all discrepancies or rule violations. If none, return an empty list.
  `);
  
  return { 
    retrievedContext: context,
    discrepancies: [response.content.toString()] 
  };
}

// 3. Risk Agent: Final assessment
export async function riskAgent(state: typeof TradeState.State) {
  console.log("--- Agent 3: Risk Assessment ---");

  // WE USE YOUR BUILDER HERE!
  const messages = buildTradePrompt({ 
    question: `Review these discrepancies: ${state.discrepancies.join(", ")} and provide a final risk assessment.`, 
    context: state.retrievedContext 
  });

  const response = await llm.invoke(messages);
  
  const rawContent = typeof response.content === "string" 
    ? response.content 
    : JSON.stringify(response.content);

  // Validate with Zod just like before
  const validated = TradeAnalysisSchema.parse(JSON.parse(rawContent));
  
  return { finalResult: validated };
}

export async function escalationAgent(state: typeof TradeState.State) {
  console.log("⚠️ --- Agent 4: Escalation (High Risk Detected) ---");
  
  const response = await llm.invoke(`
    You are a Senior Compliance Officer. Write a formal INTERNAL MEMO for a human supervisor.
    
    DATA TO INCLUDE:
    - Summary of Case: ${state.finalResult?.summary}
    - Key Violations: ${state.discrepancies.join(", ")}
    - Recommendation: ${state.finalResult?.recommendedAction}
    
    FORMAT: Professional, urgent, and clear.
  `);

  return { escalationMemo: response.content.toString() };
}