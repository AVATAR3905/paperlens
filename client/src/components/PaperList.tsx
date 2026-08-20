import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  FileText,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Paper, fetchPapers, deletePaper } from "../lib/api";
import { cn } from "@/lib/utils";

interface PaperListProps {
  papers: Paper[];
  selectedPaperId: number | null;
  onSelectPaper: (id: number | null) => void;
  onRefresh: () => void;
  onShowUpload: () => void;
}

export function PaperList({
  papers,
  selectedPaperId,
  onSelectPaper,
  onRefresh,
  onShowUpload,
}: PaperListProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPapers()
      .then((p) => {
        onRefresh();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Delete this paper and all its chunks?")) return;
    try {
      await deletePaper(id);
      if (selectedPaperId === id) onSelectPaper(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div className="w-72 border-r border-border flex flex-col h-full shrink-0">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Papers ({papers.length})
        </span>
        <div className="flex gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onShowUpload}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Add paper"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {papers.length === 0 && !loading && (
          <div className="text-center py-8 px-4">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              No papers yet
            </p>
            <button
              onClick={onShowUpload}
              className="text-sm text-emerald hover:underline"
            >
              Upload your first paper
            </button>
          </div>
        )}

        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() =>
              onSelectPaper(selectedPaperId === paper.id ? null : paper.id)
            }
            className={cn(
              "group p-2.5 rounded-lg cursor-pointer transition-all",
              selectedPaperId === paper.id
                ? "bg-secondary border border-emerald/30"
                : "hover:bg-secondary/50 border border-transparent"
            )}
          >
            <div className="flex items-start gap-2">
              <FileText
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  selectedPaperId === paper.id
                    ? "text-emerald"
                    : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {paper.title}
                </p>
                {paper.authors && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {paper.authors}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {new Date(paper.uploaded_at).toLocaleDateString()}
                  {paper.page_count > 0 && ` · ${paper.page_count} pages`}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, paper.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-red-400 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
