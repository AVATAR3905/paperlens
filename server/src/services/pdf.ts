import fs from "fs";
import pdfParse from "pdf-parse";

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  numpages: number;
}

export async function extractTextFromPdf(filePath: string): Promise<PdfExtractionResult> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  return {
    text: data.text,
    pageCount: data.numpages,
    numpages: data.numpages,
  };
}

export function extractTextFromPlainText(content: string): PdfExtractionResult {
  return {
    text: content,
    pageCount: 1,
    numpages: 1,
  };
}
