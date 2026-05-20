import { NextRequest, NextResponse } from "next/server";

// Stub — implemented on Day 4 (concept deep-dive stretch feature)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.conceptId || !body?.paperText) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Missing conceptId or paperText" } }, { status: 400 });
  }
  return NextResponse.json({ explanation: "Concept deep-dive not yet implemented." }, { status: 501 });
}
