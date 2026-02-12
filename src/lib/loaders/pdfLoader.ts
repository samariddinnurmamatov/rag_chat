import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { writeFileSync } from "fs";
import path from "path";

export const loadAndSplitPdf = async (buffer: Buffer) => {
  // vaqtinchalik file qilib yozamiz
  const tempPath = path.join(process.cwd(), "temp.pdf");
  writeFileSync(tempPath, buffer);

  const loader = new PDFLoader(tempPath);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  return splitDocs.map(doc => doc.pageContent);
};