import { StateGraph, START, END } from "@langchain/langgraph";
import { TradeState } from "./state";
import { escalationAgent } from "./nodes";
import { parsingAgent, complianceAgent, riskAgent } from "./nodes";

const workflow = new StateGraph(TradeState)
  .addNode("parser", parsingAgent)
  .addNode("compliance", complianceAgent)
  .addNode("risk_assessor", riskAgent)
  .addNode("escalator", escalationAgent) // NEW NODE
  
  .addEdge(START, "parser")
  .addEdge("parser", "compliance")
  .addEdge("compliance", "risk_assessor")
  
  // NEW CONDITIONAL LOGIC
  .addConditionalEdges(
    "risk_assessor", 
    shouldEscalate, 
    {
      escalate: "escalator", // If shouldEscalate returns "escalate"
      end: END               // If shouldEscalate returns "end"
    }
  )
  .addEdge("escalator", END); // Once memo is done, finish.

  // This function decides the next path
function shouldEscalate(state: typeof TradeState.State) {
  if (state.finalResult?.riskLevel === "HIGH") {
    return "escalate"; // Go to escalationAgent
  }
  return "end"; // Finish the process
}


export const tradeGraph = workflow.compile();