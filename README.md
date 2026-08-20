# PaperLens

Research paper Q&A system. Upload PDFs or paste text, then ask questions — get AI-powered answers with source citations.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + pgvector (vector similarity search)
- **AI**: Google Gemini API (free tier — embeddings + chat)
- **PDF**: pdf-parse

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and DATABASE_URL

# Run development servers
npm run dev
```

## Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) |
| `DATABASE_URL` | PostgreSQL connection string | Render dashboard |
| `NODE_ENV` | `development` or `production` | — |
| `PORT` | Server port (default: 3001) | — |

## Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo (Render reads `render.yaml` automatically)
4. Add `GEMINI_API_KEY` in Environment tab
5. Done — your app is live at `https://your-app.onrender.com`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/papers` | Upload PDF (multipart) or text (JSON) |
| `GET` | `/api/papers` | List all papers |
| `GET` | `/api/papers/:id` | Get paper details + chunks |
| `DELETE` | `/api/papers/:id` | Delete paper and its chunks |
| `POST` | `/api/chat` | Ask question `{ question, paperId? }` → `{ answer, sources }` |

## How It Works

1. **Upload** — PDF is parsed, split into section-aware chunks, embedded via Gemini, stored in pgvector
2. **Ask** — Question is embedded, pgvector finds top-25 similar chunks, top-5 sent to Gemini with grounding prompt
3. **Answer** — Response includes numbered citations `[1]` `[2]` with paper title, page number, and section

## License

MIT
