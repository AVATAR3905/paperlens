import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import papersRouter from "./routes/papers";
import chatRouter from "./routes/chat";
import { pool, query } from "./services/db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/papers", papersRouter);
app.use("/api/chat", chatRouter);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "paperlens" });
});

async function initDatabase() {
  const schema = `
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS papers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  authors TEXT DEFAULT '',
  filename VARCHAR(500) DEFAULT '',
  page_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_chunks (
  id SERIAL PRIMARY KEY,
  paper_id INTEGER REFERENCES papers(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  section VARCHAR(500) DEFAULT '',
  embedding vector(768) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paper_chunks_embedding
  ON paper_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_paper_chunks_paper_id
  ON paper_chunks (paper_id);
`;
  await query(schema);
  console.log("Database schema initialized");
}

async function start() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();

    await initDatabase();

    app.listen(PORT, () => {
      console.log(`PaperLens server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
