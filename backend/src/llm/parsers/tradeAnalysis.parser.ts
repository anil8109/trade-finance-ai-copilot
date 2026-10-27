import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { TradeAnalysisSchema } from "../schemas/tradeAnalysis.schema";

export const tradeAnalysisParser =
  StructuredOutputParser.fromZodSchema(TradeAnalysisSchema);
