import { BookOpen, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 glass border-b border-border/50 flex items-center px-5 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center shadow-lg shadow-emerald/20">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-semibold tracking-tight">
            <span className="text-gradient">Paper</span>Lens
          </h1>
          <div className="flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/20">
            <Sparkles className="w-3 h-3 text-emerald" />
            <span className="text-[10px] font-medium text-emerald/80 uppercase tracking-wider">
              AI Research
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
