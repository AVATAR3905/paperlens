import { FileText, Hash } from "lucide-react";
import { Source } from "../lib/api";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <div className="flex items-start gap-2 text-xs p-2 rounded-lg bg-background/50 border border-border/50">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald/20 text-emerald font-mono text-[10px] font-bold shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{source.paperTitle}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
          {source.pageNumber > 0 && (
            <span className="flex items-center gap-0.5">
              <Hash className="w-2.5 h-2.5" />
              p.{source.pageNumber}
            </span>
          )}
          {source.section && <span>· {source.section}</span>}
        </div>
        <p className="mt-1 text-muted-foreground/70 line-clamp-2">
          {source.excerpt}
        </p>
      </div>
    </div>
  );
}
