import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, Sparkles, FileUp } from "lucide-react";
import { uploadPaper, uploadTextPaper } from "../lib/api";
import { cn } from "@/lib/utils";

interface PaperUploadProps {
  onUploaded: () => void;
  onCancel: () => void;
}

export function PaperUpload({ onUploaded, onCancel }: PaperUploadProps) {
  const [mode, setMode] = useState<"pdf" | "text">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [textContent, setTextContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    setError("");
    setUploading(true);

    try {
      if (mode === "pdf" && file) {
        setProgress("Extracting text from PDF...");
        await uploadPaper(file, title || undefined, authors || undefined, (s) =>
          setProgress(s)
        );
      } else if (mode === "text" && textContent.trim()) {
        setProgress("Processing text...");
        await uploadTextPaper(textContent, title || "Untitled Paper", authors);
      } else {
        setError("Please provide content to upload");
        setUploading(false);
        return;
      }

      onUploaded();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald/20 to-emerald/5 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add Research Paper</h2>
              <p className="text-xs text-muted-foreground/60">
                Upload a PDF or paste text to analyze
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1.5 mb-6 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setMode("pdf")}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              mode === "pdf"
                ? "bg-emerald text-white shadow-lg shadow-emerald/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <FileUp className="w-4 h-4" />
              Upload PDF
            </span>
          </button>
          <button
            onClick={() => setMode("text")}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              mode === "text"
                ? "bg-emerald text-white shadow-lg shadow-emerald/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Paste Text
            </span>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Paper title"
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:border-emerald/30 focus:ring-1 focus:ring-emerald/10 placeholder:text-muted-foreground/30 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                Authors
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Smith, Johnson, et al."
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:border-emerald/30 focus:ring-1 focus:ring-emerald/10 placeholder:text-muted-foreground/30 transition-all duration-200"
              />
            </div>
          </div>

          {mode === "pdf" ? (
            <div
              {...getRootProps()}
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300",
                isDragActive
                  ? "border-emerald bg-emerald/5 shadow-lg shadow-emerald/10 scale-[1.01]"
                  : file
                  ? "border-emerald/30 bg-emerald/5"
                  : "border-border/60 hover:border-muted-foreground/30 hover:bg-secondary/30"
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald/15 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-emerald" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium mb-1">
                    Drop a PDF here or{" "}
                    <span className="text-emerald">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    Maximum file size: 50 MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                Paper Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the paper text here..."
                rows={12}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:border-emerald/30 focus:ring-1 focus:ring-emerald/10 placeholder:text-muted-foreground/30 resize-none transition-all duration-200"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3.5 py-2.5 rounded-xl animate-fade-in">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Progress */}
          {uploading && progress && (
            <div className="flex items-center gap-2.5 text-sm text-emerald bg-emerald/10 border border-emerald/20 px-3.5 py-2.5 rounded-xl animate-fade-in">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{progress}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={uploading || (mode === "pdf" && !file) || (mode === "text" && !textContent.trim())}
            className={cn(
              "w-full py-3 rounded-xl font-medium text-sm transition-all duration-200",
              (uploading || (mode === "pdf" && !file) || (mode === "text" && !textContent.trim()))
                ? "bg-secondary text-muted-foreground/40 cursor-not-allowed"
                : "bg-emerald text-white hover:bg-emerald/90 shadow-lg shadow-emerald/20 hover:shadow-emerald/30"
            )}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Add Paper
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
