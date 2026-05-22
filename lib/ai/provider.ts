import { PaperAnalysis, PaperAnalysisSchema } from "@/lib/schemas/analysis";
import { ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { smartExtract } from "@/lib/pdf/extract";
import { randomUUID } from "crypto";

// Gemini 1.5 Flash: 1M token context (~4M chars). Cap conservatively.
const GEMINI_MAX_CHARS = 700_000;
// Llama-3.3-70b on Groq free tier: hard request size limit in practice.
const GROQ_MAX_CHARS = 40_000;

async function analyzeWithGemini(text: string, errorHint?: string): Promise<unknown> {
  const prompt = errorHint
    ? ANALYSIS_PROMPT(text) + `\n\nPrevious attempt failed validation: ${errorHint}. Fix these issues.`
    : ANALYSIS_PROMPT(text);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error: ${response.status} ${err}`);
  }
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function analyzeWithGroq(text: string, errorHint?: string): Promise<unknown> {
  const prompt = errorHint
    ? ANALYSIS_PROMPT(text) + `\n\nPrevious attempt failed validation: ${errorHint}. Fix these issues.`
    : ANALYSIS_PROMPT(text);
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  const raw = data.choices[0].message.content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  return JSON.parse(raw);
}

export async function analyzePaper(rawText: string): Promise<PaperAnalysis> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  const limit = provider === "groq" ? GROQ_MAX_CHARS : GEMINI_MAX_CHARS;
  const text = smartExtract(rawText, limit);

  let raw: unknown;

  try {
    raw = provider === "groq" ? await analyzeWithGroq(text) : await analyzeWithGemini(text);
  } catch (err) {
    if (provider !== "groq") {
      console.error("[analyzePaper] Gemini failed, falling back to Groq:", err);
      const groqText = smartExtract(rawText, GROQ_MAX_CHARS);
      raw = await analyzeWithGroq(groqText);
    } else {
      throw err;
    }
  }

  const parsed = PaperAnalysisSchema.safeParse({
    ...(raw as object),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  if (!parsed.success) {
    const errorHint = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    const rawRetry = provider === "groq" ? await analyzeWithGroq(text, errorHint) : await analyzeWithGemini(text, errorHint);
    const retryParsed = PaperAnalysisSchema.safeParse({
      ...(rawRetry as object),
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    });
    if (!retryParsed.success) throw new Error("AI response failed schema validation after retry");
    return retryParsed.data;
  }

  return parsed.data;
}
