export type ExtractResult =
  | { ok: true; text: string; pageCount: number }
  | { ok: false; reason: "scanned" | "too-short" | "corrupt" };

const SECTION_MARKERS = {
  method:     ["method", "approach", "architecture", "proposed method", "our model", "system design"],
  results:    ["result", "experiment", "evaluation", "performance", "benchmark", "ablation"],
  conclusion: ["conclusion", "discussion", "summary", "future work", "future directions"],
};

export function smartExtract(text: string, charLimit: number): string {
  if (text.length <= charLimit) return text;

  const lower = text.toLowerCase();

  function findSection(keywords: string[], fromFraction = 0): number {
    const fromIdx = Math.floor(fromFraction * text.length);
    for (const kw of keywords) {
      const idx = lower.indexOf(kw, fromIdx);
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const methodIdx    = findSection(SECTION_MARKERS.method,     0.10);
  const resultIdx    = findSection(SECTION_MARKERS.results,    0.30);
  const conclusionIdx = findSection(SECTION_MARKERS.conclusion, 0.55);

  const introEnd = methodIdx > 0 ? methodIdx : Math.floor(text.length * 0.35);
  const introBudget  = Math.floor(charLimit * 0.40);
  const methodBudget = Math.floor(charLimit * 0.35);
  const conclBudget  = Math.floor(charLimit * 0.25);

  const parts: string[] = [text.slice(0, Math.min(introEnd, introBudget))];

  if (methodIdx > 0) {
    const methodEnd = resultIdx > 0 ? resultIdx : conclusionIdx > 0 ? conclusionIdx : text.length;
    parts.push(text.slice(methodIdx, Math.min(methodEnd, methodIdx + methodBudget)));
  }

  if (conclusionIdx > 0) {
    parts.push(text.slice(conclusionIdx, Math.min(text.length, conclusionIdx + conclBudget)));
  }

  return parts.join("\n\n[...]\n\n");
}

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
