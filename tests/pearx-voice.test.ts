import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createPearxVoiceHandler } from "@/lib/elevenlabs/pearx-voice";

const keys = generateKeyPairSync("ed25519");
const publicKey = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
function request(overrides = {}, tampered = false) {
  const body = JSON.stringify({ aud: "heylolaelevent:tts", issuedAt: Date.now(), nonce: randomUUID(), text: "Official source evidence.", ...overrides });
  return new Request("https://example.test/api/elevenlabs/pearx-voice", {
    method: "POST", body: tampered ? body + " " : body,
    headers: { "x-pearx-signature": sign(null, Buffer.from(body), keys.privateKey).toString("base64") },
  });
}
const env = { ELEVENLABS_API_KEY: "test-key", ELEVENLABS_VOICE_ID: "test-voice" };

describe("PearX voice relay", () => {
  it("rejects tampering, stale requests and invalid input before spending credits", async () => {
    const handle = createPearxVoiceHandler(publicKey), upstream = vi.fn();
    expect((await handle(request({}, true), env, upstream)).status).toBe(401);
    expect((await handle(request({ issuedAt: Date.now() - 70000 }), env, upstream)).status).toBe(400);
    expect((await handle(request({ text: "x".repeat(5001) }), env, upstream)).status).toBe(400);
    expect((await handle(request({ aud: "other" }), env, upstream)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it("uses existing ElevenLabs credentials and returns audio, rejecting replay on a warm instance", async () => {
    const handle = createPearxVoiceHandler(publicKey);
    const upstream = vi.fn().mockResolvedValue(new Response("audio", { headers: { "Content-Type": "audio/mpeg" } }));
    const req = request(), replay = req.clone();
    const response = await handle(req, env, upstream);
    expect(await response.text()).toBe("audio");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(upstream.mock.calls[0][0]).toBe("https://api.elevenlabs.io/v1/text-to-speech/test-voice");
    expect(upstream.mock.calls[0][1].headers["xi-api-key"]).toBe("test-key");
    expect((await handle(replay, env, upstream)).status).toBe(409);
    expect(upstream).toHaveBeenCalledTimes(1);
  });
  it("fails closed for missing configuration or provider errors", async () => {
    const handle = createPearxVoiceHandler(publicKey), upstream = vi.fn().mockRejectedValue(new Error("private provider data"));
    expect((await handle(request(), {}, upstream)).status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
    const response = await handle(request(), env, upstream);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private provider data");
  });
});
