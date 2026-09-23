/**
 * ElevenLabs agent payload builder.
 *
 * Everything here is pure so it can be unit-tested without network access.
 * Field names were checked against
 * https://elevenlabs.io/docs/api-reference/agents/create — anything we could
 * not confirm is omitted and noted in README.
 */
import { getJourney, getSource, JOURNEYS } from "@/lib/lemon";
import type { JourneyId, Lang } from "@/lib/lemon";
import { AGENT_NAME, FIRST_MESSAGE, RULES } from "./prompts";

export function buildKnowledgeBlock(lang: Lang): string {
  const lines: string[] = [];
  for (const journey of JOURNEYS) {
    lines.push(`## ${journey.title[lang]}`);
    lines.push(journey.summary[lang]);
    for (const step of journey.steps) {
      const verification =
        step.verification === "reported"
          ? "reported (confirm with Dubai Municipality)"
          : step.verification;
      lines.push(`### ${step.title[lang]} [${verification}]`);
      lines.push(step.body[lang]);
      for (const id of step.sourceIds) {
        const s = getSource(id);
        lines.push(
          `- Source: ${s.publisher} — ${s.title[lang]} — ${s.url} (reviewed ${s.reviewedOn})`,
        );
      }
    }
  }
  return lines.join("\n");
}

export function buildSystemPrompt(lang: Lang): string {
  return `${RULES[lang]}\n\nKNOWLEDGE\n${buildKnowledgeBlock(lang)}`;
}

/**
 * Client tool specs. On the wire these become `{ type: "client", ... }`
 * entries under conversation_config.agent.prompt.tools.
 */
export const CLIENT_TOOLS = [
  {
    name: "show_sources",
    description:
      "Show the source links for a journey on the website. Call this whenever you cite a step so the dog parent sees the references.",
    parameters: {
      type: "object",
      property_kind: "object",
      properties: {
        journey: {
          type: "string",
          enum: ["adopt", "register", "profile"],
          description: "The journey whose sources should be displayed.",
        },
      },
      required: ["journey"],
    },
  },
  {
    name: "set_language",
    description:
      "Switch the website language when the dog parent switches language.",
    parameters: {
      type: "object",
      property_kind: "object",
      properties: {
        language: {
          type: "string",
          enum: ["en", "ar"],
          description: "The language the conversation switched to.",
        },
      },
      required: ["language"],
    },
  },
  {
    name: "request_handover",
    description:
      "Hand the dog parent to the official service. Use whenever the question is not covered, is unverified, or the dog parent asks for a human.",
    parameters: {
      type: "object",
      property_kind: "object",
      properties: {
        reason: {
          type: "string",
          description: "Why a handover is needed.",
        },
      },
      required: ["reason"],
    },
  },
  {
    name: "open_profile_guide",
    description:
      "Open the HeyLola profile journey card on the website.",
    parameters: {
      type: "object",
      property_kind: "object",
      properties: {},
      required: [],
    },
  },
] as const;

export type ClientToolName = (typeof CLIENT_TOOLS)[number]["name"];

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel (ElevenLabs default)

export function buildAgentPayload(env: NodeJS.ProcessEnv = process.env) {
  const tools = CLIENT_TOOLS.map((tool) => ({
    type: "client",
    name: tool.name,
    description: tool.description,
    expects_response: false,
    parameters: tool.parameters,
  }));

  return {
    name: AGENT_NAME,
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGE.en,
        language: "en",
        prompt: {
          prompt: buildSystemPrompt("en"),
          llm: "gemini-2.5-flash",
          temperature: 0.2,
          tools,
        },
      },
      language_presets: {
        ar: {
          overrides: {
            agent: {
              first_message: FIRST_MESSAGE.ar,
              language: "ar",
              prompt: {
                prompt: buildSystemPrompt("ar"),
              },
            },
          },
        },
      },
      tts: {
        voice_id: env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID,
      },
      conversation: {
        max_duration_seconds: 600,
      },
    },
    platform_settings: {
      auth: {
        enable_auth: true,
      },
      overrides: {
        conversation_config_override: {
          agent: {
            language: true,
            first_message: true,
          },
        },
      },
      privacy: {
        record_voice: false,
        retention_days: 0,
        delete_transcript_and_pii: true,
        delete_audio: true,
        zero_retention_mode: true,
      },
    },
  };
}

// Re-exported for callers that only need journey ids in tool arguments.
export const JOURNEY_IDS: JourneyId[] = ["adopt", "register", "profile"];
export { getJourney };
