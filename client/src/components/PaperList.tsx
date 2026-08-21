import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  FileText,
  RefreshCw,
  BookOpen,
  ChevronRight,
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
      .then(() => onRefresh())
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
    <div className="w-72 border-r border-border/50 flex flex-col h-full shrink-0 bg-card/50">
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Library
          </span>
          <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded-md">
            {papers.length}
          </span>
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
          <button
            onClick={onShowUpload}
            className="p-1.5 rounded-lg bg-emerald/10 hover:bg-emerald/20 text-emerald hover:text-emerald transition-all duration-200"
            title="Add paper"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {papers.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium mb-1">No papers yet</p>
            <p className="text-xs text-muted-foreground/60 mb-4">
              Upload research papers to get started
            </p>
            <button
              onClick={onShowUpload}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald hover:text-emerald/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add your first paper
            </button>
          </div>
        )}

        {papers.map((paper, idx) => (
          <div
            key={paper.id}
            onClick={() =>
              onSelectPaper(selectedPaperId === paper.id ? null : paper.id)
            }
            className={cn(
              "group relative p-3 rounded-xl cursor-pointer transition-all duration-200 animate-slide-in",
              selectedPaperId === paper.id
                ? "bg-emerald/10 border border-emerald/20 shadow-sm shadow-emerald/5"
                : "hover:bg-secondary/60 border border-transparent hover:border-border/50"
            )}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200",
                  selectedPaperId === paper.id
                    ? "bg-emerald/20"
                    : "bg-secondary/80 group-hover:bg-secondary"
                )}
              >
                <FileText
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    selectedPaperId === paper.id
                      ? "text-emerald"
                      : "text-muted-foreground/60 group-hover:text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate leading-tight transition-colors duration-200",
                    selectedPaperId === paper.id
                      ? "text-foreground"
                      : "text-foreground/80 group-hover:text-foreground"
                  )}
                >
                  {paper.title}
                </p>
                {paper.authors && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {paper.authors}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/50">
                    {new Date(paper.uploaded_at).toLocaleDateString()}
                  </span>
                  {paper.page_count > 0 && (
                    <>
                      <span className="text-muted-foreground/20">·</span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {paper.page_count} pages
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => handleDelete(e, paper.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-400 transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {selectedPaperId === paper.id && (
                  <ChevronRight className="w-3 h-3 text-emerald/60" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
