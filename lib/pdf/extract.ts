export type ExtractResult =
  | { ok: true; text: string; pageCount: number }
  | { ok: false; reason: "scanned" | "too-short" | "corrupt" };

export async function extractPdfText(buffer: Buffer): Promise<ExtractResult> {
  let text: string;
  let pageCount: number;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    text = result.text;
    pageCount = result.total;
  } catch {
    return { ok: false, reason: "corrupt" };
  }

  const cleaned = text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();

  if (cleaned.length < 500) return { ok: false, reason: "scanned" };
  if (cleaned.length < 1000) return { ok: false, reason: "too-short" };

  return { ok: true, text: cleaned, pageCount };
}
