import { describe, expect, it, vi } from "vitest";
import { createMockConversation } from "@/lib/mock-agent";

function setup(lang: "en" | "ar" = "en") {
  const onMessage = vi.fn();
  const onToolCall = vi.fn();
  const convo = createMockConversation({
    lang,
    onMessage,
    onToolCall,
    delayMs: 0,
  });
  return { convo, onMessage, onToolCall };
}

describe("mock agent", () => {
  it("calls request_handover for an unknown utterance", async () => {
    const { convo, onToolCall } = setup();
    convo.start();
    convo.send("what's the fine if I don't feed my cat caviar");
    await new Promise((r) => setTimeout(r, 10));
    expect(onToolCall).toHaveBeenCalledWith(
      "request_handover",
      expect.objectContaining({ reason: expect.any(String) }),
    );
  });

  it("routes 'microchip' to show_sources register", async () => {
    const { convo, onToolCall } = setup();
    convo.send("tell me about microchip registration");
    await new Promise((r) => setTimeout(r, 10));
    expect(onToolCall).toHaveBeenCalledWith("show_sources", {
      journey: "register",
    });
  });

  it("routes Arabic شريحة to register", async () => {
    const { convo, onToolCall } = setup("ar");
    convo.send("كيف أزرع شريحة لكلبي؟");
    await new Promise((r) => setTimeout(r, 10));
    expect(onToolCall).toHaveBeenCalledWith("show_sources", {
      journey: "register",
    });
  });

  it("emits request_handover after show_sources when guidance needs authority", async () => {
    const { convo, onToolCall, onMessage } = setup();
    convo.send("what's the fine if I don't register my dog?");
    await new Promise((r) => setTimeout(r, 10));
    expect(onToolCall).toHaveBeenCalledWith("show_sources", {
      journey: "register",
    });
    expect(onToolCall).toHaveBeenCalledWith("request_handover", {
      reason: "Guidance requires authority verification",
    });
    // Agent message carries the cited sources.
    const agentMsg = onMessage.mock.calls
      .map((c) => c[0])
      .find((m) => m.role === "agent");
    expect(agentMsg?.sources?.length).toBeGreaterThan(0);
  });
});
