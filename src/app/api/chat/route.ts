import { NextResponse } from "next/server";
import { askPDF } from "@/lib/ragChain";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "No question provided" },
        { status: 400 }
      );
    }

    const answer = await askPDF(question);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}