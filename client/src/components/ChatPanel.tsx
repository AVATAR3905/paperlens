import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare, BookOpen, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
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
      {/* Context bar */}
      <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2.5 shrink-0 bg-card/30">
        <div className="w-6 h-6 rounded-lg bg-emerald/10 flex items-center justify-center">
          <BookOpen className="w-3 h-3 text-emerald" />
        </div>
        {selectedPaper ? (
          <>
            <span className="text-sm font-medium truncate">
              {selectedPaper.title}
            </span>
            <span className="text-[10px] text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-full">
              scoped
            </span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-muted-foreground">
              All papers
            </span>
            <span className="text-[10px] text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-full">
              {papers.length} loaded
            </span>
          </>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald/20 to-emerald/5 flex items-center justify-center mb-6 glow-emerald">
              <Sparkles className="w-9 h-9 text-emerald/70" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ask anything</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
              {papers.length === 0
                ? "Upload some research papers first, then ask questions about them."
                : "PaperLens will search through your papers and provide cited answers."}
            </p>
            {papers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
                {[
                  "What methodology was used?",
                  "What are the main findings?",
                  "How does this compare to other work?",
                  "What are the limitations?",
                ].map((q, i) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className={cn(
                      "text-left text-sm px-4 py-3 rounded-xl border border-border/60 bg-card/50",
                      "text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-border",
                      "transition-all duration-200 animate-fade-in"
                    )}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "animate-fade-in",
                  msg.role === "user" ? "flex justify-end" : ""
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3.5 max-w-[85%]",
                    msg.role === "user"
                      ? "bg-emerald/15 border border-emerald/20 text-foreground"
                      : "bg-card border border-border/50"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center">
                        <BookOpen className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald/80 uppercase tracking-wider">
                        PaperLens
                      </span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground prose-code:text-emerald prose-code:bg-emerald/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-pre:bg-background/60 prose-pre:border prose-pre:border-border prose-pre:rounded-xl">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40">
                      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">
                        Sources
                      </p>
                      <div className="space-y-2">
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
              <div className="animate-fade-in">
                <div className="rounded-2xl px-4 py-3.5 bg-card border border-border/50 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center">
                      <BookOpen className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald/80 uppercase tracking-wider">
                      PaperLens
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald" />
                    <span>Searching and generating answer...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border/50 shrink-0 bg-card/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end bg-secondary/60 rounded-2xl border border-border/60 px-3 py-2 focus-within:border-emerald/30 focus-within:ring-1 focus-within:ring-emerald/10 transition-all duration-200">
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
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40 resize-none py-1.5"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 shrink-0",
                input.trim() && !loading
                  ? "bg-emerald text-white hover:bg-emerald/90 shadow-lg shadow-emerald/20"
                  : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/30 text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
