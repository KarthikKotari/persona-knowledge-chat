import { prisma } from "./db";
import { SourceRef } from "./types";

const STOP_WORDS = new Set([
  "a","an","the","is","in","it","of","to","and","or","for","with","on","at","by","from",
]);

export const DEFAULT_TOP_N = 5;
export const MIN_SCORE_THRESHOLD = 0.01;

export interface RetrievedChunk {
  content: string;
  score: number;
  source: SourceRef;
}

export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

export function scoreChunk(chunkContent: string, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const words = tokenise(chunkContent);
  if (words.length === 0) return 0;

  let score = 0;
  for (const token of queryTokens) {
    const count = words.filter((w) => w === token).length;
    score += count / words.length; // TF contribution
  }
  return score;
}

export async function retrieveChunks(
  query: string,
  topN: number = DEFAULT_TOP_N,
): Promise<RetrievedChunk[]> {
  const queryTokens = tokenise(query);
  if (queryTokens.length === 0) return [];

  const chunks = await prisma.chunk.findMany({
    include: { document: { select: { title: true, filename: true } } },
  });

  const scored = chunks
    .map((chunk) => ({
      content: chunk.content,
      score: scoreChunk(chunk.content, queryTokens),
      source: { title: chunk.document.title, filename: chunk.document.filename },
    }))
    .filter((c) => c.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored;
}
