import { llm } from "./llm";
import { getVectorStore } from "./vectorstore";

export const askPDF = async (question: string) => {
  const vectorStore = await getVectorStore();

  const retriever = vectorStore.asRetriever({
    k: 4,
  });

  const docs = await retriever.invoke(question);

  const context = docs.map((doc: any) => doc.pageContent).join("\n\n");

  const prompt = `
You are an AI assistant.
Answer ONLY using the provided context.
If the answer is not in the context, say:
"I cannot find the answer in the provided PDF."

Context:
${context}

Question:
${question}
`;

  const response = await llm.invoke(prompt);

  return response.content;
};
