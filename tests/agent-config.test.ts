import { describe, expect, it } from "vitest";
import {
  buildAgentPayload,
  buildSystemPrompt,
  CLIENT_TOOLS,
} from "@/lib/elevenlabs/agent-config";

describe("agent payload", () => {
  it("includes language_presets.ar, client tools and knowledge", () => {
    const payload = buildAgentPayload({} as NodeJS.ProcessEnv);
    const cc = payload.conversation_config;
    expect(cc.language_presets.ar.overrides.agent.language).toBe("ar");
    expect(
      cc.language_presets.ar.overrides.agent.first_message.length,
    ).toBeGreaterThan(0);

    const toolNames = cc.agent.prompt.tools.map((t) => t.name);
    expect(toolNames).toEqual(
      expect.arrayContaining(CLIENT_TOOLS.map((t) => t.name)),
    );
    for (const tool of cc.agent.prompt.tools) {
      expect(tool.type).toBe("client");
    }

    expect(cc.agent.prompt.prompt).toContain("KNOWLEDGE");
    expect(cc.agent.prompt.prompt).toContain("800 900");
    expect(
      cc.language_presets.ar.overrides.agent.prompt.prompt,
    ).toContain("800 900");
  });

  it("uses the multilingual TTS model and built-in language detection", () => {
    const payload = buildAgentPayload({} as NodeJS.ProcessEnv);
    const cc = payload.conversation_config;
    expect(cc.tts.model_id).toBe("eleven_flash_v2");
    expect(
      cc.language_presets.ar.overrides.tts.model_id,
    ).toBe("eleven_flash_v2_5");
    expect(
      cc.agent.prompt.built_in_tools.language_detection.params
        .system_tool_type,
    ).toBe("language_detection");
    expect(
      cc.agent.prompt.built_in_tools.end_call.params.system_tool_type,
    ).toBe("end_call");
    expect(cc.turn).toEqual({ turn_timeout: 7, mode: "turn" });
  });

  it("system prompt contains reviewed source urls", () => {
    expect(buildSystemPrompt("en")).toContain("dm.gov.ae");
  });
});
