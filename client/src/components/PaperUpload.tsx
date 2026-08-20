import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { uploadPaper, uploadTextPaper } from "../lib/api";

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
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add Research Paper</h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("pdf")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "pdf"
                ? "bg-emerald text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setMode("text")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "text"
                ? "bg-emerald text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Paste Text
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Title <span className="text-muted-foreground">(optional for PDF)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper title"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald/50 placeholder:text-muted-foreground/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Authors <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Smith, Johnson, et al."
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald/50 placeholder:text-muted-foreground/50"
            />
          </div>

          {mode === "pdf" ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-emerald bg-emerald/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Drop a PDF here or{" "}
                    <span className="text-emerald">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Max 50 MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Paper Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the paper text here..."
                rows={10}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-emerald/50 placeholder:text-muted-foreground/50 resize-none"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {uploading && progress && (
            <div className="flex items-center gap-2 text-sm text-emerald">
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || (mode === "pdf" && !file) || (mode === "text" && !textContent.trim())}
            className="w-full py-2.5 rounded-lg bg-emerald text-white font-medium text-sm hover:bg-emerald/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Add Paper"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
