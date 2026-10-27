import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { embeddings } from "./embeddings";

let vectorStore: FaissStore | null = null;

export async function getVectorStore() {
  if (!vectorStore) {
    vectorStore = await FaissStore.fromTexts(
      [],
      [],
      embeddings
    );
  }
  return vectorStore;
}
