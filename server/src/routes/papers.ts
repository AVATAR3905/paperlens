import { Router, Request, Response } from "express";
import { upload } from "../middleware/upload";
import { extractTextFromPdf, extractTextFromPlainText } from "../services/pdf";
import { chunkText } from "../services/chunker";
import { embedBatch } from "../services/gemini";
import { query } from "../services/db";
import fs from "fs";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(
      "SELECT id, title, authors, filename, page_count, uploaded_at FROM papers ORDER BY uploaded_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperResult = await query(
      "SELECT id, title, authors, filename, page_count, uploaded_at FROM papers WHERE id = $1",
      [id]
    );

    if (paperResult.rows.length === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const chunksResult = await query(
      "SELECT id, chunk_index, content, page_number, section FROM paper_chunks WHERE paper_id = $1 ORDER BY chunk_index",
      [id]
    );

    res.json({
      ...paperResult.rows[0],
      chunks: chunksResult.rows,
    });
  } catch (error) {
    console.error("Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const client = await (await import("../services/db")).pool.connect();
    try {
      let title = req.body.title || "Untitled Paper";
      let authors = req.body.authors || "";
      let fullText = "";
      let pageCount = 1;
      let filename = "";

      if (req.file) {
        filename = req.file.originalname;
        const pdfResult = await extractTextFromPdf(req.file.path);
        fullText = pdfResult.text;
        pageCount = pdfResult.pageCount;

        if (!req.body.title) {
          const firstLines = fullText.split("\n").filter((l: string) => l.trim()).slice(0, 5).join(" ");
          title = firstLines.substring(0, 200).trim() || filename.replace(/\.pdf$/i, "");
        }

        fs.unlinkSync(req.file.path);
      } else if (req.body.content) {
        const textResult = extractTextFromPlainText(req.body.content);
        fullText = textResult.text;
        pageCount = textResult.pageCount;
        title = req.body.title || "Untitled Paper";
        authors = req.body.authors || "";
      } else {
        return res.status(400).json({ error: "No file or content provided" });
      }

      await client.query("BEGIN");

      const paperResult = await client.query(
        "INSERT INTO papers (title, authors, filename, page_count) VALUES ($1, $2, $3, $4) RETURNING id",
        [title, authors, filename, pageCount]
      );
      const paperId = paperResult.rows[0].id;

      const chunks = chunkText(fullText, pageCount);
      const embeddings = await embedBatch(chunks.map((c) => c.content));

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        await client.query(
          "INSERT INTO paper_chunks (paper_id, chunk_index, content, page_number, section, embedding) VALUES ($1, $2, $3, $4, $5, $6::vector)",
          [paperId, chunk.chunkIndex, chunk.content, chunk.pageNumber, chunk.section, `[${embedding.join(",")}]`]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        id: paperId,
        title,
        authors,
        filename,
        pageCount,
        chunks: chunks.length,
      });
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error creating paper:", error);
      const detail = error?.message || "Unknown error";
      res.status(500).json({ error: `Failed to process paper: ${detail}` });
    } finally {
      client.release();
    }
  }
);

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM papers WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting paper:", error);
    res.status(500).json({ error: "Failed to delete paper" });
  }
});

export default router;
