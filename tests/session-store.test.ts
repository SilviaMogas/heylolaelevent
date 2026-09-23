import { describe, expect, it, vi } from "vitest";
import {
  parseSessionEvent,
  storeSessionEvent,
} from "@/lib/supabase/session-store";

const ID = "11111111-2222-4333-8444-555555555555";
const ENV = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "srk" };

function okFetch(body: unknown = []) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
}

describe("parseSessionEvent", () => {
  it("rejects malformed events", () => {
    expect(parseSessionEvent(null)).toBeNull();
    expect(parseSessionEvent({ type: "start", mode: "x", lang: "en" })).toBeNull();
    expect(parseSessionEvent({ type: "message", conversationId: "nope", role: "user", text: "hi" })).toBeNull();
    expect(parseSessionEvent({ type: "end", conversationId: ID, extra: 1 })).toEqual({
      type: "end",
      conversationId: ID,
    });
  });

  it("truncates long text", () => {
    const ev = parseSessionEvent({ type: "message", conversationId: ID, role: "user", text: "a".repeat(5000) });
    expect(ev && ev.type === "message" && ev.text.length).toBe(2000);
  });
});

describe("storeSessionEvent", () => {
  it("is disabled without Supabase env", async () => {
    const f = vi.fn();
    const res = await storeSessionEvent(f, {}, { type: "end", conversationId: ID });
    expect(res).toEqual({ ok: false, disabled: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("creates a conversation with the service key in the heylola_eleven schema", async () => {
    const f = okFetch([{ id: ID }]);
    const res = await storeSessionEvent(f as unknown as typeof fetch, ENV, {
      type: "start",
      mode: "demo",
      lang: "ar",
      keepTranscript: false,
    });
    expect(res).toEqual({ ok: true, conversationId: ID });
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://x.supabase.co/rest/v1/conversations?select=id");
    const h = init.headers as Record<string, string>;
    expect(h["Content-Profile"]).toBe("heylola_eleven");
    expect(h.Authorization).toBe("Bearer srk");
    expect(JSON.parse(init.body as string)).toEqual({ mode: "demo", lang: "ar", keep_transcript: false });
  });

  it("does not store messages unless the conversation opted in", async () => {
    const f = okFetch([{ keep_transcript: false }]);
    const res = await storeSessionEvent(f as unknown as typeof fetch, ENV, {
      type: "message",
      conversationId: ID,
      role: "user",
      text: "hello",
    });
    expect(res).toEqual({ ok: true });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("stores messages when opted in", async () => {
    const f = okFetch([{ keep_transcript: true }]);
    await storeSessionEvent(f as unknown as typeof fetch, ENV, {
      type: "message",
      conversationId: ID,
      role: "agent",
      text: "hi",
    });
    expect(f).toHaveBeenCalledTimes(2);
    expect((f.mock.calls[1] as [string])[0]).toBe("https://x.supabase.co/rest/v1/messages");
  });

  it("records a lead and flags the conversation on handover", async () => {
    const f = okFetch();
    await storeSessionEvent(f as unknown as typeof fetch, ENV, {
      type: "handover",
      conversationId: ID,
      lang: "en",
      reason: "unverified",
    });
    expect((f.mock.calls[0] as [string])[0]).toBe("https://x.supabase.co/rest/v1/leads");
    const [url, init] = f.mock.calls[1] as [string, RequestInit];
    expect(url).toContain(`/conversations?id=eq.${ID}`);
    expect(init.method).toBe("PATCH");
  });

  it("reports upstream failures", async () => {
    const f = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    const res = await storeSessionEvent(f as unknown as typeof fetch, ENV, { type: "end", conversationId: ID });
    expect(res).toEqual({ ok: false, status: 500 });
  });
});
