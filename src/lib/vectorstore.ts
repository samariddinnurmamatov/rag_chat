import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./embeddings";

const COLLECTION_NAME = "pdf-collection";

export const createVectorStore = async (chunks: string[]) => {
  const vectorStore = await Chroma.fromTexts(
    chunks,
    chunks.map((_, i) => ({
      source: "pdf",
      chunk: i,
    })), // ✅ metadata bo‘sh emas
    embeddings,
    {
      collectionName: COLLECTION_NAME,
      url: "http://localhost:8000",
    }
  );

  return vectorStore;
};

export const getVectorStore = async () => {
  return await Chroma.fromExistingCollection(
    embeddings,
    {
      collectionName: COLLECTION_NAME,
      url: "http://localhost:8000",
    }
  );
};