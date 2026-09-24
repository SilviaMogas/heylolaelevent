/**
 * Server-only persistence of voice sessions in the shared Supabase project,
 * schema `heylola_eleven`. Kept pure (fetch + env injected) like signed-url.ts
 * so it can be unit-tested. When Supabase env is missing every call is a
 * no-op that reports `{ ok: false, disabled: true }`; the site keeps working.
 */

export const SUPABASE_SCHEMA = "heylola_eleven";

export type Lang = "en" | "ar";
export type Mode = "live" | "demo";

export type SessionEvent =
  | { type: "start"; mode: Mode; lang: Lang; keepTranscript: boolean }
  | { type: "message"; conversationId: string; role: "agent" | "user"; text: string }
  | { type: "handover"; conversationId: string; lang: Lang; reason?: string }
  | { type: "end"; conversationId: string };

export type StoreResult =
  | { ok: true; conversationId?: string }
  | { ok: false; disabled?: true; status?: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXT = 2000;

export function parseSessionEvent(body: unknown): SessionEvent | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const isLang = (v: unknown): v is Lang => v === "en" || v === "ar";
  const isId = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

  switch (b.type) {
    case "start":
      if ((b.mode !== "live" && b.mode !== "demo") || !isLang(b.lang)) return null;
      return {
        type: "start",
        mode: b.mode,
        lang: b.lang,
        keepTranscript: b.keepTranscript === true,
      };
    case "message":
      if (!isId(b.conversationId)) return null;
      if (b.role !== "agent" && b.role !== "user") return null;
      if (typeof b.text !== "string" || !b.text.trim()) return null;
      return {
        type: "message",
        conversationId: b.conversationId,
        role: b.role,
        text: b.text.slice(0, MAX_TEXT),
      };
    case "handover":
      if (!isId(b.conversationId) || !isLang(b.lang)) return null;
      return {
        type: "handover",
        conversationId: b.conversationId,
        lang: b.lang,
        reason: typeof b.reason === "string" ? b.reason.slice(0, 500) : undefined,
      };
    case "end":
      if (!isId(b.conversationId)) return null;
      return { type: "end", conversationId: b.conversationId };
    default:
      return null;
  }
}

function headers(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "Accept-Profile": SUPABASE_SCHEMA,
    "Content-Profile": SUPABASE_SCHEMA,
    ...extra,
  };
}

export async function storeSessionEvent(
  fetchImpl: typeof fetch,
  env: Record<string, string | undefined>,
  event: SessionEvent,
): Promise<StoreResult> {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, disabled: true };

  const rest = `${url.replace(/\/$/, "")}/rest/v1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  type Conv =
    | { ok: true; open: boolean; keep: boolean }
    | { ok: false; status: number };
  const keepTranscript = async (id: string): Promise<Conv> => {
    const r = await fetchImpl(
      `${rest}/conversations?id=eq.${id}&select=keep_transcript,ended_at`,
      { headers: headers(key), signal: controller.signal },
    );
    if (!r.ok) return { ok: false, status: r.status };
    const rows = (await r.json()) as { keep_transcript: boolean; ended_at: string | null }[];
    const row = rows[0];
    return { ok: true, open: !!row && row.ended_at === null, keep: !!row?.keep_transcript };
  };

  try {
    let res: Response;
    switch (event.type) {
      case "start":
        res = await fetchImpl(`${rest}/conversations?select=id`, {
          method: "POST",
          headers: headers(key, { Prefer: "return=representation" }),
          body: JSON.stringify({
            mode: event.mode,
            lang: event.lang,
            keep_transcript: event.keepTranscript,
          }),
          signal: controller.signal,
        });
        if (!res.ok) return { ok: false, status: res.status };
        {
          const rows = (await res.json()) as { id: string }[];
          return { ok: true, conversationId: rows[0]?.id };
        }
      case "message": {
        // Only persist when the visitor opted in to keeping the transcript.
        const conv = await keepTranscript(event.conversationId);
        if (!conv.ok) return { ok: false, status: conv.status };
        if (!conv.open || !conv.keep) return { ok: true };
        res = await fetchImpl(`${rest}/messages`, {
          method: "POST",
          headers: headers(key, { Prefer: "return=minimal" }),
          body: JSON.stringify({
            conversation_id: event.conversationId,
            role: event.role,
            text: event.text,
          }),
          signal: controller.signal,
        });
        break;
      }
      case "handover": {
        // The reason may contain the visitor's own words: keep it only with
        // transcript consent. Ignore handovers for unknown/ended sessions.
        const conv = await keepTranscript(event.conversationId);
        if (!conv.ok) return { ok: false, status: conv.status };
        if (!conv.open) return { ok: true };
        res = await fetchImpl(`${rest}/leads`, {
          method: "POST",
          headers: headers(key, { Prefer: "return=minimal" }),
          body: JSON.stringify({
            conversation_id: event.conversationId,
            lang: event.lang,
            reason: conv.keep ? (event.reason ?? null) : null,
          }),
          signal: controller.signal,
        });
        if (res.ok) {
          await fetchImpl(`${rest}/conversations?id=eq.${event.conversationId}`, {
            method: "PATCH",
            headers: headers(key, { Prefer: "return=minimal" }),
            body: JSON.stringify({ handover: true }),
            signal: controller.signal,
          });
        }
        break;
      }
      case "end":
        res = await fetchImpl(
          `${rest}/conversations?id=eq.${event.conversationId}&ended_at=is.null`,
          {
            method: "PATCH",
            headers: headers(key, { Prefer: "return=minimal" }),
            body: JSON.stringify({ ended_at: new Date().toISOString() }),
            signal: controller.signal,
          },
        );
        break;
    }
    return res.ok ? { ok: true } : { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 502 };
  } finally {
    clearTimeout(timeout);
  }
}
