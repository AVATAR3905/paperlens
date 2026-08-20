import { useState, useCallback } from "react";
import { Layout } from "./components/Layout";
import { PaperList } from "./components/PaperList";
import { PaperUpload } from "./components/PaperUpload";
import { ChatPanel } from "./components/ChatPanel";
import { Paper, fetchPapers } from "./lib/api";

export default function App() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const refreshPapers = useCallback(async () => {
    try {
      const list = await fetchPapers();
      setPapers(list);
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    }
  }, []);

  return (
    <Layout>
      <div className="flex h-full">
        <PaperList
          papers={papers}
          selectedPaperId={selectedPaperId}
          onSelectPaper={setSelectedPaperId}
          onRefresh={refreshPapers}
          onShowUpload={() => setShowUpload(true)}
        />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {showUpload ? (
            <PaperUpload
              onUploaded={() => {
                refreshPapers();
                setShowUpload(false);
              }}
              onCancel={() => setShowUpload(false)}
            />
          ) : (
            <ChatPanel
              paperId={selectedPaperId}
              papers={papers}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
