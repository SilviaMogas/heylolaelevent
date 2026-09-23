import { describe, expect, it } from "vitest";
import {
  composeAnswer,
  findJourney,
  findRelevantSteps,
  getGuidance,
  getSource,
  JOURNEYS,
} from "@/lib/lemon";

const FAR_FUTURE = new Date("2030-01-01T00:00:00Z");

describe("lemon answer", () => {
  it("flags unverified steps as needing the authority", () => {
    const g = getGuidance("register", "en");
    const penalties = g.steps.find((s) => s.step.id === "reg-penalties");
    expect(penalties?.needsAuthority).toBe(true);
  });

  it("flags stale sources (far-future today) as stale + needsAuthority", () => {
    const g = getGuidance("register", "en", FAR_FUTURE);
    expect(g.steps.every((s) => s.needsAuthority)).toBe(true);
    expect(g.steps.some((s) => s.stale)).toBe(true);
  });

  it("every step's sourceIds resolve; non-unverified steps have >=1 source", () => {
    for (const journey of JOURNEYS) {
      for (const step of journey.steps) {
        for (const id of step.sourceIds) {
          expect(() => getSource(id)).not.toThrow();
        }
        if (step.verification !== "unverified" && step.authority !== "heylola") {
          expect(step.sourceIds.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("composeAnswer(null) hands over and includes 800 900", () => {
    const a = composeAnswer(null, "en");
    expect(a.handover).toBe(true);
    expect(a.text).toContain("800 900");
  });

  it("findJourney keyword routing", () => {
    expect(findJourney("I want to adopt a dog", "en")).toBe("adopt");
    expect(findJourney("how do I microchip my dog", "en")).toBe("register");
    expect(findJourney("organise my dog's records in a profile", "en")).toBe(
      "profile",
    );
    expect(findJourney("أريد تبنّي كلب", "ar")).toBe("adopt");
    expect(findJourney("ما هو رقم الشريحة", "ar")).toBe("register");
    expect(findJourney("what is the weather", "en")).toBeNull();
  });

  it("routes an utterance about fines to the penalties step and hands over", () => {
    const a = composeAnswer(
      "register",
      "en",
      new Date(),
      "What is the fine if I don't register my dog?",
    );
    expect(a.text).toContain("Penalties for not registering");
    expect(a.handover).toBe(true);
  });

  it("still yields the first 3 registration steps for a generic question", () => {
    const a = composeAnswer("register", "en", new Date(), "how do I register my dog");
    expect(a.text).toContain("Microchip at a vet");
    expect(a.text).toContain("Vaccination up to date");
    expect(a.text).toContain("Apply for registration with Dubai Municipality");
  });

  it("findRelevantSteps matches only keyworded steps", () => {
    const steps = findRelevantSteps("is there a fine?", "register", "en");
    expect(steps.map((s) => s.id)).toEqual(["reg-penalties"]);
    expect(findRelevantSteps("hello", "register", "en")).toEqual([]);
  });
});
