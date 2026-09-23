import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const agentConfigured = Boolean(process.env.ELEVENLABS_AGENT_ID);
  const keyConfigured = Boolean(process.env.ELEVENLABS_API_KEY);
  return NextResponse.json(
    {
      ok: true,
      voice: agentConfigured && keyConfigured ? "live" : "demo",
      agentConfigured,
      keyConfigured,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
