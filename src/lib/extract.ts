import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// Extract plain text from an uploaded resume. Text-based PDFs and DOCX extract
// well; scanned/image PDFs have no text layer and will come back empty (caller
// surfaces that). The user edits the result as markdown afterward.
export async function extractResumeText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  let text: string;
  if (ext === "pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } else if (ext === "docx") {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    throw new Error("Unsupported file type — upload a PDF or DOCX.");
  }

  text = text.trim();
  if (!text) {
    throw new Error("Couldn't read any text — the file may be scanned or image-only.");
  }
  return text;
}
