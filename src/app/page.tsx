"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function truncateFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot) : "";
  const base = dot >= 0 ? name.slice(0, dot) : name;
  if (base.length <= 24) return name;
  const half = Math.ceil(base.length / 2);
  return base.slice(0, half) + "..." + ext;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    alert("PDF indexed successfully ✅");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();
    const aiMessage: Message = { role: "assistant", content: data.answer };
    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Chat with PDF</h1>
                <p className="text-sm text-slate-500">Upload a PDF and ask questions</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Upload */}
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="flex-1 flex items-center gap-2 min-h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
                  <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="truncate" title={file?.name}>{file ? truncateFileName(file.name) : "Choose PDF file"}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {uploading ? "Uploading…" : "Upload PDF"}
                </button>
              </div>
            </div>

            {/* Chat */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/30">
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && !loading && (
                  <p className="text-sm text-slate-400 text-center py-8">Messages will appear here after you ask a question.</p>
                )}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-white border border-slate-200 shadow-sm">
                      <span className="inline-flex gap-1 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask a question about the PDF..."
                className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
              />
              <button
                type="button"
                onClick={handleSend}
                className="shrink-0 px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
