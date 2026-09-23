/**
 * Signed-URL fetching for live conversations. Kept pure (fetch + env
 * injected) so it can be unit-tested without Next.js or the network.
 */

export type SignedUrlResult =
  | { ok: true; signedUrl: string }
  | { ok: false; status: number; body: { error: string; mock?: boolean } };

export async function getSignedUrl(
  fetchImpl: typeof fetch,
  env: Record<string, string | undefined>,
): Promise<SignedUrlResult> {
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_AGENT_ID) {
    return {
      ok: false,
      status: 503,
      body: { error: "voice_unavailable", mock: true },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetchImpl(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(env.ELEVENLABS_AGENT_ID)}`,
      {
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      return {
        ok: false,
        status: res.status === 404 ? 503 : 502,
        body: { error: "voice_unavailable", mock: true },
      };
    }
    const data = (await res.json()) as { signed_url?: string };
    if (!data.signed_url) {
      return {
        ok: false,
        status: 502,
        body: { error: "voice_unavailable", mock: true },
      };
    }
    return { ok: true, signedUrl: data.signed_url };
  } catch {
    return {
      ok: false,
      status: 503,
      body: { error: "voice_unavailable", mock: true },
    };
  } finally {
    clearTimeout(timeout);
  }
}
