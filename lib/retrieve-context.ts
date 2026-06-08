import { KNOWLEDGE_CHUNKS, type KnowledgeChunk } from "@/data/knowledge-base";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "about",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "into",
  "he",
  "she",
  "they",
  "his",
  "her",
  "their",
  "him",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "does",
  "did",
  "tell",
  "me",
  "please",
  "abdullah",
  "imran",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]): number {
  const haystack = `${chunk.title} ${chunk.tags.join(" ")} ${chunk.content}`.toLowerCase();
  let score = 0;

  for (const token of queryTokens) {
    if (chunk.tags.some((tag) => tag.includes(token) || token.includes(tag))) {
      score += 4;
    }
    if (chunk.title.toLowerCase().includes(token)) {
      score += 3;
    }
    if (haystack.includes(token)) {
      score += 1;
    }
  }

  return score;
}

export function retrieveContext(query: string, limit = 6): string {
  const tokens = tokenize(query);
  const ranked = KNOWLEDGE_CHUNKS.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, tokens),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const selected =
    ranked.length > 0
      ? ranked.map((item) => item.chunk)
      : [
          KNOWLEDGE_CHUNKS.find((c) => c.id === "summary")!,
          KNOWLEDGE_CHUNKS.find((c) => c.id === "identity")!,
        ];

  return selected
    .map(
      (chunk) =>
        `### ${chunk.title}\n${chunk.content}`,
    )
    .join("\n\n");
}
