/**
 * Create or update the ElevenLabs agent from `lib/elevenlabs/agent-config`.
 *
 *   npm run elevenlabs:sync            # POST create (no ELEVENLABS_AGENT_ID)
 *                                      # or PATCH update (id set)
 *   npm run elevenlabs:sync -- --dry-run
 *   # or run with no ELEVENLABS_API_KEY at all -> prints the payload and exits
 *
 * The API key is only ever sent as the xi-api-key header — never logged.
 */
import { buildAgentPayload } from "../lib/elevenlabs/agent-config";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const payload = buildAgentPayload(process.env);

  if (dryRun || !apiKey) {
    if (!apiKey && !dryRun) {
      console.log(
        "# ELEVENLABS_API_KEY is not set — printing payload instead of calling the API.",
      );
    }
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }

  const url = agentId
    ? `https://api.elevenlabs.io/v1/convai/agents/${agentId}`
    : "https://api.elevenlabs.io/v1/convai/agents/create";

  const res = await fetch(url, {
    method: agentId ? "PATCH" : "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error(`ElevenLabs API error ${res.status}: ${body}`);
    process.exit(1);
  }

  try {
    const parsed = JSON.parse(body) as { agent_id?: string };
    console.log(parsed.agent_id ?? body);
  } catch {
    console.log(body);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
