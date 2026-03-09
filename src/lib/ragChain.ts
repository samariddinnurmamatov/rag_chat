import { llm } from "./llm";
import {
  getLastPdfChunks,
  getChunksByKeywordSearch,
} from "./pdfStore";
import { getVectorStore } from "./vectorstore";

const K_CHUNKS = 8;

function buildPrompt(context: string, question: string): string {
  return `You are an AI assistant. Answer using ONLY the provided context from the PDF.
If the context contains relevant information, answer clearly in the same language as the question (e.g. Uzbek or English).
If the context does NOT contain relevant information, reply: "I cannot find the answer in the provided PDF."

Context:
${context}

Question:
${question}`;
}

export const askPDF = async (question: string) => {
  let contextChunks: string[] = [];

  try {
    const vectorStore = await getVectorStore();
    const retriever = vectorStore.asRetriever({ k: K_CHUNKS });
    const docs = await retriever.invoke(question);
    contextChunks = docs.map((doc: { pageContent?: string }) => doc?.pageContent ?? "").filter(Boolean);
  } catch {
    // Chroma not running or error — use keyword fallback
  }

  if (contextChunks.length === 0) {
    contextChunks = getChunksByKeywordSearch(question, K_CHUNKS);
  }

  const memoryChunks = getLastPdfChunks();
  if (memoryChunks.length === 0 && contextChunks.length === 0) {
    return "Please upload a PDF first, then ask your question.";
  }

  const context = contextChunks.length > 0
    ? contextChunks.join("\n\n")
    : memoryChunks.slice(0, K_CHUNKS).join("\n\n");

  const prompt = buildPrompt(context, question);
  const response = await llm.invoke(prompt);
  return response.content as string;
};
