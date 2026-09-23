import { describe, expect, it, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  afterEach(() => {
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_AGENT_ID;
  });

  it("reports demo when env vars are missing", async () => {
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_AGENT_ID;
    const res = await GET();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const body = await res.json();
    expect(body).toEqual({
      ok: true,
      voice: "demo",
    });
  });

  it("reports live when both env vars are set", async () => {
    process.env.ELEVENLABS_API_KEY = "k";
    process.env.ELEVENLABS_AGENT_ID = "a";
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({
      ok: true,
      voice: "live",
    });
    // Never leaks the values themselves.
    expect(JSON.stringify(body)).not.toContain('"k"');
    expect(JSON.stringify(body)).not.toContain('"a"');
  });
});
