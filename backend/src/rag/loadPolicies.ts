import { getVectorStore } from "./vectorStore";

export async function loadTradePolicies() {
  const store = await getVectorStore();

  const docs = [
    {
      text: "Letters of Credit must comply with UCP 600 rules.",
      metadata: { source: "UCP600", section: "General" },
    },
    {
      text: "High-risk countries require additional compliance checks.",
      metadata: { source: "Internal Policy", section: "Risk" },
    },
  ];

  await store.addDocuments(
    docs.map(d => ({
      pageContent: d.text,
      metadata: d.metadata,
    }))
  );

  console.log("Trade policies loaded into FAISS");
}
