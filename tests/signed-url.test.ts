import { describe, expect, it, vi } from "vitest";
import { getSignedUrl } from "@/lib/elevenlabs/signed-url";

describe("getSignedUrl", () => {
  it("returns 503 mock when env is missing", async () => {
    const res = await getSignedUrl(fetch, {});
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(503);
      expect(res.body.mock).toBe(true);
    }
  });

  it("returns 502/503 when upstream fetch fails", async () => {
    const failing = vi.fn().mockRejectedValue(new Error("network"));
    const res = await getSignedUrl(failing as unknown as typeof fetch, {
      ELEVENLABS_API_KEY: "k",
      ELEVENLABS_AGENT_ID: "a",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect([502, 503]).toContain(res.status);
      expect(res.body.mock).toBe(true);
    }
  });

  it("returns the signed url on success", async () => {
    const okFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ signed_url: "wss://signed" }), {
        status: 200,
      }),
    );
    const res = await getSignedUrl(okFetch as unknown as typeof fetch, {
      ELEVENLABS_API_KEY: "k",
      ELEVENLABS_AGENT_ID: "a",
    });
    expect(res).toEqual({ ok: true, signedUrl: "wss://signed" });
    // API key goes only in the header, never the URL.
    const url = okFetch.mock.calls[0][0] as string;
    expect(url).toContain("agent_id=a");
    expect(url).not.toContain("k");
  });
});
