import { PaperAnalysis, PaperAnalysisSchema } from "@/lib/schemas/analysis";
import { ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { randomUUID } from "crypto";

async function analyzeWithGemini(text: string, errorHint?: string): Promise<unknown> {
  const prompt = errorHint
    ? ANALYSIS_PROMPT(text) + `\n\nPrevious attempt failed validation: ${errorHint}. Fix these issues.`
    : ANALYSIS_PROMPT(text);
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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

const GROQ_MAX_CHARS = 15_000;

async function analyzeWithGroq(text: string, errorHint?: string): Promise<unknown> {
  const truncated = text.length > GROQ_MAX_CHARS ? text.slice(0, GROQ_MAX_CHARS) + "\n\n[Text truncated for length]" : text;
  const prompt = errorHint
    ? ANALYSIS_PROMPT(truncated) + `\n\nPrevious attempt failed validation: ${errorHint}. Fix these issues.`
    : ANALYSIS_PROMPT(truncated);
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

export async function analyzePaper(text: string): Promise<PaperAnalysis> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  let raw: unknown;

  try {
    raw = provider === "groq" ? await analyzeWithGroq(text) : await analyzeWithGemini(text);
  } catch (err) {
    if (provider !== "groq") {
      console.error("[analyzePaper] Gemini failed, falling back to Groq:", err);
      raw = await analyzeWithGroq(text);
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
