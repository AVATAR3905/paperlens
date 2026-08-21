import { FileText, Hash } from "lucide-react";
import { Source } from "../lib/api";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <div className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-background/40 border border-border/40 hover:border-border/60 transition-colors duration-200">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-emerald/15 text-emerald font-mono text-[10px] font-bold shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <span className="font-medium text-foreground/80 truncate">
            {source.paperTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground/50">
          {source.pageNumber > 0 && (
            <span className="flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              p.{source.pageNumber}
            </span>
          )}
          {source.section && <span>· {source.section}</span>}
        </div>
        <p className="mt-1.5 text-muted-foreground/50 line-clamp-2 leading-relaxed">
          {source.excerpt}
        </p>
      </div>
    </div>
  );
}
