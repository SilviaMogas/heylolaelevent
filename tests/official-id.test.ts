import { describe, expect, it } from "vitest";
import {
  assertNoOfficialIdClaim,
  OFFICIAL_ID_DISCLAIMER,
  JOURNEYS,
} from "@/lib/lemon";
import { SYNTHETIC_CONVERSATIONS } from "@/lib/demo/synthetic";
import { buildSystemPrompt } from "@/lib/elevenlabs/agent-config";

describe("official-id guardrail", () => {
  it("flags forbidden claims", () => {
    expect(
      assertNoOfficialIdClaim("HeyLola issues an official Dubai dog ID").length,
    ).toBeGreaterThan(0);
    expect(
      assertNoOfficialIdClaim("HeyLola verifies your municipality registration")
        .length,
    ).toBeGreaterThan(0);
    expect(
      assertNoOfficialIdClaim("HeyLola تُصدر هوية رسمية لكلبك").length,
    ).toBeGreaterThan(0);
  });

  it("allows disclaimers, guidance bodies, synthetic lines and prompts", () => {
    expect(assertNoOfficialIdClaim(OFFICIAL_ID_DISCLAIMER.en)).toEqual([]);
    expect(assertNoOfficialIdClaim(OFFICIAL_ID_DISCLAIMER.ar)).toEqual([]);

    for (const journey of JOURNEYS) {
      for (const step of journey.steps) {
        expect(assertNoOfficialIdClaim(step.body.en)).toEqual([]);
        expect(assertNoOfficialIdClaim(step.body.ar)).toEqual([]);
      }
    }

    for (const convo of SYNTHETIC_CONVERSATIONS) {
      for (const line of convo.lines) {
        if (line.role === "agent") {
          expect(assertNoOfficialIdClaim(line.text)).toEqual([]);
        }
      }
    }

    expect(assertNoOfficialIdClaim(buildSystemPrompt("en"))).toEqual([]);
    expect(assertNoOfficialIdClaim(buildSystemPrompt("ar"))).toEqual([]);
  });
});
