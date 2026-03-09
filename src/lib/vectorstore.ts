import { ChromaClient } from "chromadb";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./embeddings";

const COLLECTION_NAME = "pdf-collection";
const CHROMA_URL = "http://localhost:8000";

/** Remove existing collection so each upload replaces the previous PDF. */
async function ensureCleanCollection() {
  try {
    const client = new ChromaClient({ path: CHROMA_URL });
    await client.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // Collection may not exist or Chroma not running — continue
  }
}

export const createVectorStore = async (chunks: string[]) => {
  await ensureCleanCollection();
  const vectorStore = await Chroma.fromTexts(
    chunks,
    chunks.map((_, i) => ({
      source: "pdf",
      chunk: i,
    })), // ✅ metadata bo‘sh emas
    embeddings,
    {
      collectionName: COLLECTION_NAME,
      url: CHROMA_URL,
    }
  );

  return vectorStore;
};

export const getVectorStore = async () => {
  return await Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });
};