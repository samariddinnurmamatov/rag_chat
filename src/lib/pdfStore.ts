/**
 * In-memory store for the last uploaded PDF chunks.
 * Used when Chroma is unavailable or returns no results (e.g. keyword fallback).
 */
let lastPdfChunks: string[] = [];

export function setLastPdfChunks(chunks: string[]) {
  lastPdfChunks = chunks;
}

export function getLastPdfChunks(): string[] {
  return lastPdfChunks;
}

/**
 * Simple keyword-based retrieval: score chunks by overlap with question words.
 * Helps when vector search fails or for exact/phrase-like queries (e.g. "GO'RO'G'LINING TUG'ILISHI").
 */
export function getChunksByKeywordSearch(question: string, k: number = 8): string[] {
  if (lastPdfChunks.length === 0) return [];

  const words = question
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (words.length === 0) return lastPdfChunks.slice(0, k);

  const scored = lastPdfChunks.map((chunk) => {
    const lower = chunk.toLowerCase().replace(/[''`]/g, "'");
    let score = 0;
    for (const word of words) {
      if (lower.includes(word)) score += 1;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0);
  if (top.length === 0) return lastPdfChunks.slice(0, k);
  return top.slice(0, k).map((s) => s.chunk);
}
