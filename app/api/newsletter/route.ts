// Newsletter signup — forwards to the group's central newsletter hub
// (subirachsventures.com), which stores the subscriber in Supabase and sends
// the welcome + internal notification via Resend. Proxied server-side so the
// browser never has to deal with CORS against the hub.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUB_SUBSCRIBE_URL = "https://www.subirachsventures.com/api/subscribe";
const SOURCE = "heylola";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; consent?: unknown; signup_url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  }

  const visitorIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  try {
    const res = await fetch(HUB_SUBSCRIBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(visitorIp ? { "x-forwarded-for": visitorIp } : {}),
      },
      body: JSON.stringify({
        email,
        source: SOURCE,
        consent: true,
        signup_url: typeof body.signup_url === "string" ? body.signup_url.slice(0, 500) : undefined,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string };
    if (!res.ok || data.ok === false) {
      return NextResponse.json(
        { error: data.error || "Unable to subscribe right now." },
        { status: res.status >= 400 && res.status < 500 ? 400 : 502 },
      );
    }
    return NextResponse.json({ ok: true, status: data.status ?? "subscribed" });
  } catch {
    return NextResponse.json({ error: "Unable to subscribe right now." }, { status: 502 });
  }
}
