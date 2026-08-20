export interface Chunk {
  content: string;
  pageNumber: number;
  section: string;
  chunkIndex: number;
}

const SECTION_PATTERNS = [
  /^\s*(abstract|summary)\s*$/im,
  /^\s*(\d+\.?\s+)?introduction\s*$/im,
  /^\s*(\d+\.?\s+)?related\s+work\s*$/im,
  /^\s*(\d+\.?\s+)?(?:background|preliminaries)\s*$/im,
  /^\s*(\d+\.?\s+)?methods?(?:ology)?\s*$/im,
  /^\s*(\d+\.?\s+)?approach\s*$/im,
  /^\s*(\d+\.?\s+)?(?:experiment(?:s|al)?(?:\s+(?:setup|results?|evaluation))?)\s*$/im,
  /^\s*(\d+\.?\s+)?results?\s*$/im,
  /^\s*(\d+\.?\s+)?(?:discussion|analysis)\s*$/im,
  /^\s*(\d+\.?\s+)?conclusions?\s*$/im,
  /^\s*(\d+\.?\s+)?(?:future\s+work|outlook)\s*$/im,
  /^\s*(\d+\.?\s+)?(?:limitations)\s*$/im,
  /^\s*(\d+\.?\s+)?(?:acknowledg(?:e?ments?|ed))\s*$/im,
  /^\s*(\d+\.?\s+)?references?\s*$/im,
  /^\s*(\d+\.?\s+)?appendix\s*\w*\s*$/im,
];

const EQUATION_PLACEHOLDER = "__EQUATION_";
const CITATION_PLACEHOLDER = "__CITATION_";

function protectSpecialContent(text: string): { protected: string; restore: (s: string) => string } {
  let counter = 0;
  const replacements: Map<string, string> = new Map();

  const protectedText = text.replace(
    /(\$\$[\s\S]*?\$\$|\$[^$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g,
    (match) => {
      const placeholder = `${EQUATION_PLACEHOLDER}${counter++}__`;
      replacements.set(placeholder, match);
      return placeholder;
    }
  );

  return {
    protected: protectedText,
    restore: (s: string) => {
      let result = s;
      for (const [placeholder, original] of replacements) {
        result = result.replace(placeholder, original);
      }
      return result;
    },
  };
}

function detectSection(text: string): string | null {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 100) continue;
    for (const pattern of SECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return trimmed.replace(/^\d+\.?\s*/, "").trim();
      }
    }
  }
  return null;
}

function splitBySentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
}

export function chunkText(
  fullText: string,
  totalPages: number,
  maxChunkSize: number = 800,
  overlap: number = 150
): Chunk[] {
  const { protected: safeText, restore } = protectSpecialContent(fullText);

  const paragraphs = safeText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const chunks: Chunk[] = [];
  let chunkIndex = 0;
  let currentSection = "Introduction";
  let currentChunk = "";
  let estimatedPage = 1;

  const pageEstimate = totalPages > 1 ? Math.max(1, Math.floor(fullText.length / totalPages)) : fullText.length;

  for (const paragraph of paragraphs) {
    const restored = restore(paragraph.trim());
    const detected = detectSection(restored);

    if (detected) {
      if (currentChunk.trim().length > 50) {
        chunks.push({
          content: restore(currentChunk.trim()),
          pageNumber: estimatedPage,
          section: currentSection,
          chunkIndex: chunkIndex++,
        });
      }
      currentSection = detected;
      currentChunk = "";
    }

    if ((currentChunk + "\n\n" + restored).length > maxChunkSize && currentChunk.trim().length > 50) {
      chunks.push({
        content: restore(currentChunk.trim()),
        pageNumber: estimatedPage,
        section: currentSection,
        chunkIndex: chunkIndex++,
      });

      const sentences = splitBySentences(currentChunk);
      const overlapSentences = sentences.slice(-Math.ceil(sentences.length * 0.2));
      currentChunk = overlapSentences.join(" ") + "\n\n";
    }

    currentChunk += restored + "\n\n";
    estimatedPage = Math.min(
      totalPages,
      Math.floor((chunkIndex * pageEstimate) / Math.max(1, paragraphs.length)) + 1
    );
  }

  if (currentChunk.trim().length > 50) {
    chunks.push({
      content: restore(currentChunk.trim()),
      pageNumber: Math.min(totalPages, estimatedPage),
      section: currentSection,
      chunkIndex: chunkIndex++,
    });
  }

  return chunks;
}
