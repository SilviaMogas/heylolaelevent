import { verify } from "node:crypto";

const PEARX_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAO2mnYBZZFG6ga0PWrJpS7IQuHt7cHqiKWIthG48JqK0=
-----END PUBLIC KEY-----`;

const json = (status: number, error: string) => Response.json({ error }, {
  status, headers: { "Cache-Control": "no-store" },
});

export function createPearxVoiceHandler(publicKey = PEARX_PUBLIC_KEY) {
  const used = new Map<string, number>();
  return async (request: Request, env: Record<string, string | undefined>, fetchImpl = fetch) => {
    try {
      // Bound the body while reading, even without a Content-Length header.
      const reader = request.body?.getReader();
      if (!reader) return json(400, "Invalid request.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 32000) {
          await reader.cancel();
          return json(413, "Request too large.");
        }
        chunks.push(value);
      }
      const raw = Buffer.concat(chunks);
      const signature = request.headers.get("x-pearx-signature") || "";
      if (!/^[A-Za-z0-9+/]{86}==$/.test(signature) ||
          !verify(null, raw, publicKey, Buffer.from(signature, "base64"))) {
        return json(401, "Invalid signature.");
      }
      let payload;
      try { payload = JSON.parse(raw.toString()); } catch { return json(400, "Invalid request."); }
      const now = Date.now();
      if (!payload || payload.aud !== "heylolaelevent:tts" ||
          !Number.isSafeInteger(payload.issuedAt) || payload.issuedAt > now + 5000 ||
          payload.issuedAt < now - 60000 || typeof payload.nonce !== "string" ||
          !/^[a-f0-9-]{36}$/.test(payload.nonce) || typeof payload.text !== "string" ||
          !payload.text.trim() || payload.text.length > 5000) return json(400, "Invalid request.");
      if (!env.ELEVENLABS_API_KEY) return json(503, "Voice is not configured.");
      for (const [key, expiry] of used) if (expiry < now) used.delete(key);
      if (used.has(payload.nonce)) return json(409, "Request already used.");
      if (used.size >= 1000) return json(429, "Please try later.");
      used.set(payload.nonce, payload.issuedAt + 65000);
      const voice = env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
      const response = await fetchImpl(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
        method: "POST", signal: AbortSignal.timeout(25000),
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg", "xi-api-key": env.ELEVENLABS_API_KEY },
        body: JSON.stringify({ text: payload.text, model_id: env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2" }),
      });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) {
        return json(503, "Voice is unavailable.");
      }
      return new Response(response.body, {
        headers: { "Content-Type": response.headers.get("content-type")!, "Cache-Control": "no-store" },
      });
    } catch { return json(503, "Voice is unavailable."); }
  };
}
