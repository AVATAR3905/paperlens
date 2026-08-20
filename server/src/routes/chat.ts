import { Router, Request, Response } from "express";
import { embedQuery, generateAnswer, SourceChunk } from "../services/gemini";
import { query } from "../services/db";

const router = Router();

interface ChatRequest {
  question: string;
  paperId?: number;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, paperId } = req.body as ChatRequest;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Question is required" });
    }

    const queryEmbedding = await embedQuery(question);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    let sqlQuery: string;
    let params: unknown[];

    if (paperId) {
      sqlQuery = `
        SELECT
          pc.id,
          pc.content,
          pc.page_number,
          pc.section,
          p.title as paper_title,
          p.id as paper_id,
          1 - (pc.embedding <=> $1::vector) as similarity
        FROM paper_chunks pc
        JOIN papers p ON p.id = pc.paper_id
        WHERE pc.paper_id = $2
        ORDER BY pc.embedding <=> $1::vector
        LIMIT 25
      `;
      params = [embeddingStr, paperId];
    } else {
      sqlQuery = `
        SELECT
          pc.id,
          pc.content,
          pc.page_number,
          pc.section,
          p.title as paper_title,
          p.id as paper_id,
          1 - (pc.embedding <=> $1::vector) as similarity
        FROM paper_chunks pc
        JOIN papers p ON p.id = pc.paper_id
        ORDER BY pc.embedding <=> $1::vector
        LIMIT 25
      `;
      params = [embeddingStr];
    }

    const result = await query(sqlQuery, params);

    if (result.rows.length === 0) {
      return res.json({
        answer: "No papers have been uploaded yet. Please upload some research papers first.",
        sources: [],
      });
    }

    const topChunks = result.rows.slice(0, 5);

    const sources: SourceChunk[] = topChunks.map((row: any) => ({
      content: row.content,
      paperTitle: row.paper_title,
      pageNumber: row.page_number,
      section: row.section,
      similarity: parseFloat(row.similarity),
    }));

    const answer = await generateAnswer(question, sources);

    const allSources = result.rows.map((row: any) => ({
      paperId: row.paper_id,
      paperTitle: row.paper_title,
      pageNumber: row.page_number,
      section: row.section,
      excerpt: row.content.substring(0, 300) + (row.content.length > 300 ? "..." : ""),
      similarity: parseFloat(row.similarity),
    }));

    res.json({ answer, sources: allSources });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

export default router;
