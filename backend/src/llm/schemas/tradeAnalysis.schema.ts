import { z } from "zod";

export const TradeAnalysisSchema = z.object({
  summary: z.string().describe("Short summary of the trade case"),
  discrepancies: z
    .array(z.string())
    .describe("List of compliance or data issues"),
  riskLevel: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .describe("Overall risk assessment"),
  recommendedAction: z
    .string()
    .describe("Next action for trade operations team"),
});

export type TradeAnalysisResult = z.infer<typeof TradeAnalysisSchema>;
