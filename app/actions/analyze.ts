"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractPdfText } from "@/lib/pdf/extract";
import { analyzePaper } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/utils/ratelimit";
import type { PaperAnalysis } from "@/lib/schemas/analysis";

type ActionOk = { ok: true; data: PaperAnalysis };
type ActionErr = { ok: false; code: string; message: string };
export type AnalyzeResult = ActionOk | ActionErr;

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function analyzeAction(formData: FormData): Promise<AnalyzeResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, code: "UNAUTHORIZED", message: "Please sign in to analyze papers." };
  }
  const { allowed } = checkRateLimit(session.user.email, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!allowed) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: `You've reached the limit of ${RATE_LIMIT_MAX} analyses per hour. Please try again later.`,
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, code: "BAD_REQUEST", message: "No file provided." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, code: "BAD_REQUEST", message: "Please upload a PDF file." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, code: "BAD_REQUEST", message: "File exceeds the 20 MB limit." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extracted = await extractPdfText(buffer);

  if (!extracted.ok) {
    const messages: Record<typeof extracted.reason, string> = {
      scanned: "This appears to be a scanned PDF. Please upload a machine-readable PDF.",
      "too-short": "The PDF contains too little text to analyze.",
      corrupt: "The PDF could not be read. Please try a different file.",
    };
    return { ok: false, code: "UNPROCESSABLE", message: messages[extracted.reason] };
  }

  try {
    const analysis = await analyzePaper(extracted.text);
    return { ok: true, data: analysis };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429") || message.toLowerCase().includes("rate")) {
      return { ok: false, code: "RATE_LIMITED", message: "The analysis service is busy. Please wait a minute and try again." };
    }
    console.error("[analyzeAction]", err);
    return { ok: false, code: "SERVER_ERROR", message: "Something went wrong. Please try again." };
  }
}
