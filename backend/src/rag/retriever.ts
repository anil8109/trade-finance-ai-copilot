import { getVectorStore } from "./vectorStore";

export async function getRelevantTradePolicies(query: string) {
  const store = await getVectorStore();
  
  // Search for the top 2 most relevant policy snippets
  const results = await store.similaritySearch(query, 2);
  
  if (results.length === 0) {
    return "No specific trade policies found for this query.";
  }

  // Format the results with metadata for citations
  return results
    .map(doc => `[Source: ${doc.metadata.source}] ${doc.pageContent}`)
    .join("\n\n");
}