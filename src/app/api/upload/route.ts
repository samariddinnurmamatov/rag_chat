import { NextRequest, NextResponse } from "next/server";
import { loadAndSplitPdf } from "@/lib/loaders/pdfLoader";
import { createVectorStore, getVectorStore } from "@/lib/vectorstore";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
    
        if (!file) {
          return NextResponse.json(
            { error: "No file uploaded" },
            { status: 400 }
          );
        }
    
        const buffer = Buffer.from(await file.arrayBuffer());
    
        const chunks = await loadAndSplitPdf(buffer);
    
        await createVectorStore(chunks);
    
        return NextResponse.json({
          message: "PDF indexed successfully",
          chunks: chunks.length,
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: "Failed to process PDF" },
          { status: 500 }
        );
      }
}
