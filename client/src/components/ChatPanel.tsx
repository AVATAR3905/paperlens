import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, BookOpen } from "lucide-react";
import { askQuestion, ChatResponse, Source, Paper } from "../lib/api";
import { SourceCard } from "./SourceCard";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  paperId: number | null;
  papers: Paper[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export function ChatPanel({ paperId, papers }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedPaper = papers.find((p) => p.id === paperId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      inputRef.current?.focus();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await askQuestion(question, paperId ?? undefined);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Failed to get answer"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
        {selectedPaper ? (
          <>
            <BookOpen className="w-4 h-4 text-emerald" />
            <span className="text-sm font-medium truncate">
              {selectedPaper.title}
            </span>
            <span className="text-xs text-muted-foreground">
              (all papers)
            </span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 text-emerald" />
            <span className="text-sm font-medium">
              Ask about all papers ({papers.length})
            </span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-emerald/60" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ask a question</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask anything about your research papers. PaperLens will find
              relevant passages and cite its sources.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
              {[
                "What methodology was used?",
                "What are the main findings?",
                "How does this compare to other work?",
                "What are the limitations?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-3xl mx-auto",
              msg.role === "user" ? "flex justify-end" : ""
            )}
          >
            <div
              className={cn(
                "rounded-xl px-4 py-3",
                msg.role === "user"
                  ? "bg-emerald/10 border border-emerald/20 max-w-md"
                  : "bg-secondary/50 border border-border"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-emerald flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald">
                    PaperLens
                  </span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Sources
                  </p>
                  <div className="space-y-1.5">
                    {msg.sources.map((source, j) => (
                      <SourceCard key={j} source={source} index={j} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl px-4 py-3 bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-emerald flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald">
                  PaperLens
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching papers and generating answer...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              paperId
                ? "Ask about this paper..."
                : "Ask about your papers..."
            }
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald/50 placeholder:text-muted-foreground/50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald text-white hover:bg-emerald/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
