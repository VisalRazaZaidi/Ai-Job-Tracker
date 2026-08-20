import mammoth from "mammoth";

type MatrixValues = { a: number; b: number; c: number; d: number; e: number; f: number };

class NodeDOMMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor(values?: number[] | MatrixValues) {
    if (Array.isArray(values)) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = values;
    } else if (values) {
      ({ a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f } = values);
    } else {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;
    }
  }

  translate(x: number, y: number) {
    return new NodeDOMMatrix({
      a: this.a,
      b: this.b,
      c: this.c,
      d: this.d,
      e: this.e + x,
      f: this.f + y,
    });
  }

  scale(x: number, y = x) {
    return new NodeDOMMatrix({
      a: this.a * x,
      b: this.b * x,
      c: this.c * y,
      d: this.d * y,
      e: this.e,
      f: this.f,
    });
  }
}

function installDomMatrixPolyfill() {
  const globals = globalThis as unknown as {
    DOMMatrix?: typeof NodeDOMMatrix;
  };
  if (!globals.DOMMatrix) {
    globals.DOMMatrix = NodeDOMMatrix as unknown as typeof NodeDOMMatrix;
  }
}

// Extract plain text from an uploaded resume. Text-based PDFs and DOCX extract
// well; scanned/image PDFs have no text layer and will come back empty (caller
// surfaces that). The user edits the result as markdown afterward.
export async function extractResumeText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  let text: string;
  if (ext === "pdf") {
    // pdf-parse's PDF.js build expects this browser global on Vercel's Node runtime.
    installDomMatrixPolyfill();
    const { PDFParse } = await import("pdf-parse");
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
