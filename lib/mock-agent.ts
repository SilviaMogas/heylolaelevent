/**
 * Mock conversation — a local stand-in for the ElevenLabs agent used in demo
 * mode and tests. It routes text through Lemon exactly like the real agent's
 * knowledge block and emits the same client-tool calls.
 */
import { composeAnswer, findJourney } from "@/lib/lemon";
import type { Lang } from "@/lib/lemon";
import { FIRST_MESSAGE } from "@/lib/elevenlabs/prompts";

export interface MockToolCall {
  name: "show_sources" | "set_language" | "request_handover" | "open_profile_guide";
  parameters: Record<string, unknown>;
}

export interface MockConversationOptions {
  lang: Lang;
  onMessage?: (message: { role: "agent" | "user"; text: string }) => void;
  onToolCall?: (name: MockToolCall["name"], parameters: Record<string, unknown>) => void;
  /** Response delay in ms (tests can pass 0). */
  delayMs?: number;
}

export interface MockConversation {
  start: () => void;
  send: (text: string) => void;
  setLang: (lang: Lang) => void;
  end: () => void;
}

export function createMockConversation({
  lang: initialLang,
  onMessage,
  onToolCall,
  delayMs = 600,
}: MockConversationOptions): MockConversation {
  let lang = initialLang;
  let ended = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    start() {
      onMessage?.({ role: "agent", text: FIRST_MESSAGE[lang] });
    },
    send(text: string) {
      if (ended) return;
      onMessage?.({ role: "user", text });
      const journey = findJourney(text, lang);
      timer = setTimeout(() => {
        if (ended) return;
        if (journey === null) {
          const answer = composeAnswer(null, lang);
          onMessage?.({ role: "agent", text: answer.text });
          onToolCall?.("request_handover", { reason: text });
          return;
        }
        const answer = composeAnswer(journey, lang);
        onMessage?.({ role: "agent", text: answer.text });
        onToolCall?.("show_sources", { journey });
        if (journey === "profile") {
          onToolCall?.("open_profile_guide", {});
        }
      }, delayMs);
    },
    setLang(next: Lang) {
      lang = next;
      onToolCall?.("set_language", { language: next });
    },
    end() {
      ended = true;
      if (timer) clearTimeout(timer);
    },
  };
}
