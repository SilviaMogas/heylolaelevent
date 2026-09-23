import { NextResponse } from "next/server";
import { parseSessionEvent, storeSessionEvent } from "@/lib/supabase/session-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const event = parseSessionEvent(body);
  if (!event) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  const result = await storeSessionEvent(fetch, process.env, event);
  if (!result.ok) {
    if (result.disabled) return new Response(null, { status: 204 });
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, conversationId: result.conversationId });
}
