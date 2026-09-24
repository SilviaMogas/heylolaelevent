# HeyLola × ElevenLabs — Adopt a dog in Dubai (challenge demo)

## What this is

A small standalone website built for a challenge: an ElevenLabs voice agent
("Lola") that explains how to adopt a dog in Dubai, what Dubai Municipality
registration and microchipping involve, and how to organise records in a
HeyLola profile.

**This repo is separate from every HeyLola product repository.** It shares
only brand colours and the tagline. It is not affiliated with Dubai
Municipality and is not the HeyLola product.

## Demo

- **Mock mode (default)** — with no ElevenLabs credentials the site serves
  `/api/elevenlabs/signed-url` → `503 { error: "voice_unavailable", mock: true }`
  and the voice panel falls back to a local mock agent that answers from the
  same Lemon knowledge. Four scripted demo conversations can be played.
- **Live mode** — with `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` set, the
  panel requests a signed URL and starts a real WebRTC conversation.

## Setup

```bash
cp .env.example .env.local   # fill in ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID
npm install
npm run dev
```

| Variable               | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `ELEVENLABS_API_KEY`   | Server-side API key (signed URL + sync). Required.  |
| `ELEVENLABS_AGENT_ID`  | Agent to run. Created by `npm run elevenlabs:sync`. |
| `ELEVENLABS_VOICE_ID`  | Optional voice override when syncing the agent.     |
| `SUPABASE_URL`         | Optional. Shared "Subirachs Ventures" project.      |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, server-only. Enables `/api/session` storage. |

No `NEXT_PUBLIC_*` variables are needed.

## Storage (Supabase, schema `heylola_eleven`)

Tables live in the shared Supabase project `dhvwycxkkbqzvmrkysym`, schema
`heylola_eleven` (see `supabase/migrations/0001_heylola_eleven.sql`):

- `conversations` — one row per voice/demo session: mode, language,
  `keep_transcript`, `handover`, start/end times. No personal data.
- `messages` — transcript lines, written **only** when the visitor ticked
  "keep a transcript".
- `leads` — handover requests (`request_handover` tool) with the agent's reason.

The browser only talks to `POST /api/session`; the route writes with the
service-role key. `anon` has no privileges on the schema. Without the two
Supabase variables the route answers `204` and nothing is stored.
The migration does not touch `pgrst.db_schemas` (shared list); the schema is
already exposed in the project settings.

## Architecture

```
browser ──voice panel──> /api/elevenlabs/signed-url ──> ElevenLabs (signed URL)
   │                                                          │
   └── startSession({ signedUrl, clientTools }) ◄──WebRTC─────┘
         ├─ show_sources(journey)   → highlights journey card + sources
         ├─ set_language(language)  → switches UI en/ar
         ├─ request_handover(reason)→ handover card (DM 800 900, dm.gov.ae)
         └─ open_profile_guide()    → opens profile journey card

Lemon (lib/lemon) is a self-contained module: a dated source registry,
three guidance journeys, keyword routing, answer composition and the
"no official HeyLola ID" guardrail. The agent's knowledge block is
generated from Lemon at sync time; the mock agent answers from it at
runtime.
```

## What "Lemon" is

This repository started empty, so "Lemon" had no definition here. In the wider
HeyLola context the only "Lemon" is **LemonSlice**, the video-avatar embed that
wraps Lola's voice agent on the production homepage. That embed is a hosted
widget: it cannot receive a consent gate, a language switch, client tools or a
source-grounded knowledge block, and it needs production LemonSlice credentials
that this challenge must not use. We therefore did **not** integrate LemonSlice.

Instead, `lib/lemon/` is a small, isolated, dependency-free module for
source-backed guidance:

- `sources.ts` — dated registry of Dubai Municipality (official) and press
  (secondary) sources with `reviewedOn`; `isStale()` flags entries older than
  180 days.
- `guidance.ts` — the three journeys as steps, each carrying `sourceIds`,
  a `verification` level (`official` / `reported` / `unverified`) and the
  responsible `authority`.
- `answer.ts` — `getGuidance`, `findJourney`, `composeAnswer`: turns a journey
  into a cited answer, appends caveats for reported/unverified steps, and routes
  unanswerable questions to Dubai Municipality (`AUTHORITY_CONTACT`).
- `official-id.ts` — `assertNoOfficialIdClaim` guardrail and the canonical
  disclaimer that HeyLola does not issue or verify an official Dubai dog ID.

Lemon is the single source of truth for the page (journey cards, footer
sources, handover section), for the ElevenLabs system prompt
(`lib/elevenlabs/agent-config.ts`) and for the mock agent. No LemonSlice or
other production HeyLola code is imported.

## Sources & review dates

Every procedural claim links to an entry in `lib/lemon/sources.ts`. Keep this
table in sync manually when the registry changes.

| Source                                   | Kind      | Reviewed   |
| ---------------------------------------- | --------- | ---------- |
| dm-portal — Dubai Municipality portal    | official  | 2026-09-23 |
| dm-veterinary — DM Veterinary system     | official  | 2026-09-23 |
| dm-contact — DM Help & Support / FAQ     | official  | 2026-09-23 |
| dm-app — Dubai Municipality app          | official  | 2026-09-23 |
| e247-dm-vet-guide — Emirates 24\|7 guide | secondary | 2026-09-23 |
| wam-dm-h1-2026 — WAM H1 2026 services    | secondary | 2026-09-23 |
| gulfnews-amend-2024 — microchip update   | secondary | 2026-09-23 |

Sources older than 180 days are flagged "needs re-check" in the UI and make
the step `needsAuthority`.

## Trust rules

- Dubai Municipality is the **only** authority for registration, microchip
  records and the official tag (call 800 900, dm.gov.ae, DM app / DubaiNow /
  Aleef).
- HeyLola only provides a separate profile to organise information. It never
  issues, verifies or replaces an official Dubai dog ID —
  `lib/lemon/official-id.ts` scans all canned agent text for violations.
- No partnerships: the site does not list or recommend shelters and claims no
  partnership with any shelter or with Dubai Municipality.
- Anything not in the knowledge block → the agent says it can't verify and
  hands over to Dubai Municipality.

## Privacy

- Consent dialog before any microphone or connection (required checkbox).
- Optional "keep transcript for this session" — off by default; when off only
  the last two lines are held in state.
- Data minimisation: no names, IDs or documents are requested; nothing is
  persisted after the page closes.
- The agent payload sets `record_voice: false`, `retention_days: -1` (required by the API when `zero_retention_mode` is on),
  `delete_transcript_and_pii`, `delete_audio` and `zero_retention_mode`.

## Tests & checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Results on the PR commit (Node 22, 2026-09-23):

| Check | Result |
| --- | --- |
| `npm run lint` | no warnings or errors |
| `npm run typecheck` | clean |
| `npm test` | 7 files, 20 tests passed |
| `npm run build` | success |

Tests cover: source fallback and stale-source flagging, official-ID wording
guardrail (including negated disclaimers), EN/AR key parity and RTL switching,
signed-URL failure modes (missing key, timeout, bad upstream), mock-agent
routing and handover, agent payload shape, and voice-panel consent/demo flow.

## Known limitations

- The mock agent is keyword routing, not an LLM — demo only.
- Arabic system prompt is one language preset; other languages fall back to
  English.
- Source review dates are maintained by hand.
- ElevenLabs schema fields we were less sure about (client-tool
  `parameters.property_kind`) are included but should be confirmed against the
  API response on first sync.

## Deployment

Set `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` (and optionally
`ELEVENLABS_VOICE_ID`) as environment variables in Vercel.
Check `https://<domain>/api/health`: `voice: "live"` means both variables
are present (the endpoint never reports which one is missing, nor values).
**Do not deploy this repo to any production HeyLola property.**

## Voice quality

- TTS model `eleven_flash_v2_5` (multilingual, EN/AR) via the Arabic language
  preset; English uses `eleven_flash_v2`. `optimize_streaming_latency: 3`.
- Built-in system tools: `language_detection` (switch EN ↔ AR mid-call) and
  `end_call` (hang up on goodbye).
- The live panel has a microphone mute toggle, a listening/speaking/muted
  status pill and an input-level meter.

## Configuring the ElevenLabs agent

```bash
npm run elevenlabs:sync            # creates the agent, prints agent_id
ELEVENLABS_AGENT_ID=agt_... npm run elevenlabs:sync   # updates it
npm run elevenlabs:sync -- --dry-run                 # print payload only
```

Dashboard notes:

- Overrides for `agent.language` and `agent.first_message` must stay enabled
  (the payload sets them under `platform_settings.overrides`) so the Arabic
  preset and per-session language can take over.
- The four tools are **client tools** — the website implements them; they
  only need matching names in the agent config.
- `platform_settings.auth.enable_auth` is on, so every session needs a signed
  URL from `/api/elevenlabs/signed-url`.
