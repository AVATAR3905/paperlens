const API_BASE = "/api";

export interface Paper {
  id: number;
  title: string;
  authors: string;
  filename: string;
  page_count: number;
  uploaded_at: string;
}

export interface PaperDetail extends Paper {
  chunks: {
    id: number;
    chunk_index: number;
    content: string;
    page_number: number;
    section: string;
  }[];
}

export interface Source {
  paperId: number;
  paperTitle: string;
  pageNumber: number;
  section: string;
  excerpt: string;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export async function fetchPapers(): Promise<Paper[]> {
  const res = await fetch(`${API_BASE}/papers`);
  if (!res.ok) throw new Error("Failed to fetch papers");
  return res.json();
}

export async function fetchPaper(id: number): Promise<PaperDetail> {
  const res = await fetch(`${API_BASE}/papers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch paper");
  return res.json();
}

export async function uploadPaper(
  file: File,
  title?: string,
  authors?: string,
  onProgress?: (status: string) => void
): Promise<{ id: number; title: string; chunks: number }> {
  onProgress?.("Uploading file...");

  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (authors) formData.append("authors", authors);

  const res = await fetch(`${API_BASE}/papers`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to upload paper");
  }

  return res.json();
}

export async function uploadTextPaper(
  content: string,
  title: string,
  authors: string
): Promise<{ id: number; title: string; chunks: number }> {
  const res = await fetch(`${API_BASE}/papers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, title, authors }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to upload paper");
  }

  return res.json();
}

export async function deletePaper(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/papers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete paper");
}

export async function askQuestion(
  question: string,
  paperId?: number
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, paperId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to get answer");
  }

  return res.json();
}
