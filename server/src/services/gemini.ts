import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("WARNING: GEMINI_API_KEY is not set. Embeddings and chat will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "missing" });

const EMBEDDING_MODEL = "gemini-embedding-001";
const CHAT_MODEL = "gemini-2.0-flash";
const EMBEDDING_DIMENSIONS = 768;

function normalizeVector(vector: number[]): number[] {
  let norm = 0;
  for (const v of vector) {
    norm += v * v;
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

export async function embedDocument(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = result.embeddings?.[0]?.values;
  if (!values) throw new Error("No embeddings returned from Gemini");
  return normalizeVector(values);
}

export async function embedQuery(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  const values = result.embeddings?.[0]?.values;
  if (!values) throw new Error("No embeddings returned from Gemini");
  return normalizeVector(values);
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await Promise.all(batch.map((text) => embedDocument(text)));
    results.push(...embeddings);
  }

  return results;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export interface SourceChunk {
  content: string;
  paperTitle: string;
  pageNumber: number;
  section: string;
  similarity: number;
}

export async function generateAnswer(
  question: string,
  sources: SourceChunk[]
): Promise<string> {
  const contextBlocks = sources
    .map(
      (s, i) =>
        `[${i + 1}] Paper: "${s.paperTitle}" | Page ${s.pageNumber} | Section: ${s.section}\n${s.content}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a research paper assistant. Answer the question based ONLY on the provided context excerpts from research papers.

RULES:
1. Only use facts from the context excerpts below
2. Cite sources using [1], [2], etc. matching the source numbers above
3. If the context doesn't contain enough information, say "Based on the available context, I don't have enough information to fully answer this question."
4. Be precise with numbers, percentages, and data — do not round or approximate
5. Distinguish between what the paper(s) state vs your interpretation
6. If multiple papers are referenced, note which paper each finding comes from
7. Keep your answer concise but thorough

CONTEXT EXCERPTS:
---
${contextBlocks}
---

QUESTION: ${question}

ANSWER:`;

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  return response.text ?? "I was unable to generate an answer.";
}
