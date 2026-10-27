import { Annotation } from "@langchain/langgraph";
import { TradeAnalysisResult } from "../llm/schemas/tradeAnalysis.schema";

export const TradeState = Annotation.Root({
  // The raw input from the user
  input: Annotation<string>(),
  // The cleaned data from the Parsing Agent
  parsedData: Annotation<any>(),
  // The relevant policies found in RAG
  retrievedContext: Annotation<string>(),
  // Discrepancies found by Compliance Agent
  discrepancies: Annotation<string[]>(),
  // The final analysis result
  finalResult: Annotation<TradeAnalysisResult | null>(),

  escalationMemo: Annotation<string | null>(),
});