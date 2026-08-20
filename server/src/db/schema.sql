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
