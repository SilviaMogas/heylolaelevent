import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const live = Boolean(
    process.env.ELEVENLABS_AGENT_ID && process.env.ELEVENLABS_API_KEY,
  );
  return NextResponse.json(
    { ok: true, voice: live ? "live" : "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
