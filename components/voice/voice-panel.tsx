"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useLang } from "@/components/lang-provider";
import { createMockConversation } from "@/lib/mock-agent";
import type { MockConversation } from "@/lib/mock-agent";
import { SYNTHETIC_CONVERSATIONS } from "@/lib/demo/synthetic";
import { AUTHORITY_CONTACT } from "@/lib/lemon";
import type { JourneyId, Lang, Source } from "@/lib/lemon";

type PanelState =
  | "idle"
  | "consent"
  | "connecting"
  | "live"
  | "demo"
  | "ended"
  | "error-mic"
  | "error";

interface TranscriptLine {
  role: "agent" | "user";
  text: string;
  sources?: Source[];
}

interface PanelEvents {
  onShowSources?: (journey: JourneyId) => void;
  onOpenProfileGuide?: () => void;
}

function HandoverCard() {
  const { t } = useLang();
  return (
    <div className="rounded-lg border border-brand/50 bg-cream p-4 text-sm">
      <p className="font-bold">{t("voice.handover.title")}</p>
      <p className="mt-1">
        Dubai Municipality —{" "}
        <a className="underline" href="tel:800900">
          800 900
        </a>{" "}
        —{" "}
        <a
          className="underline"
          href="https://www.dm.gov.ae/"
          target="_blank"
          rel="noopener noreferrer"
        >
          dm.gov.ae
        </a>
      </p>
      <p className="text-charcoal/70">
        {AUTHORITY_CONTACT.apps.join(" · ")}
      </p>
      <p className="mt-1 text-charcoal/70">
        {t("voice.handover.heylola")}
      </p>
    </div>
  );
}

export function VoicePanelLauncher(events: PanelEvents) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Return focus to the CTA after the dialog closes (Esc, ×, Cancel).
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
    } else if (wasOpen.current) {
      wasOpen.current = false;
      launcherRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-base font-bold text-charcoal shadow hover:bg-sunny"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
        {t("hero.ask")}
      </button>
      {open && (
        <ConversationProvider>
          <VoicePanelInner {...events} onClose={() => setOpen(false)} />
        </ConversationProvider>
      )}
    </>
  );
}

function VoicePanelInner({
  onClose,
  onShowSources,
  onOpenProfileGuide,
}: PanelEvents & { onClose: () => void }) {
  const { lang, setLang, t } = useLang();
  const [state, setState] = useState<PanelState>("consent");
  const [agree, setAgree] = useState(false);
  const [keepTranscript, setKeepTranscript] = useState(false);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [handover, setHandover] = useState(false);
  const [input, setInput] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<MockConversation | null>(null);

  const pushLine = useCallback(
    (line: TranscriptLine) => {
      setLines((prev) => {
        if (keepTranscript) return [...prev, line];
        // Data minimisation: only keep the last two lines.
        return [...prev, line].slice(-2);
      });
    },
    [keepTranscript],
  );

  const clientToolHandlers = useCallback(
    (name: string, parameters: Record<string, unknown>) => {
      if (name === "show_sources") {
        onShowSources?.(parameters.journey as JourneyId);
      } else if (name === "set_language") {
        setLang(parameters.language as Lang);
      } else if (name === "request_handover") {
        setHandover(true);
      } else if (name === "open_profile_guide") {
        onOpenProfileGuide?.();
      }
    },
    [onShowSources, onOpenProfileGuide, setLang],
  );

  const conversation = useConversation({
    clientTools: {
      show_sources: async (p: Record<string, unknown>) =>
        clientToolHandlers("show_sources", p),
      set_language: async (p: Record<string, unknown>) =>
        clientToolHandlers("set_language", p),
      request_handover: async (p: Record<string, unknown>) =>
        clientToolHandlers("request_handover", p),
      open_profile_guide: async (p: Record<string, unknown>) =>
        clientToolHandlers("open_profile_guide", p),
    },
    onMessage: (m: { message?: string; source?: string }) => {
      if (m?.message) {
        pushLine({
          role: m.source === "user" ? "user" : "agent",
          text: m.message,
        });
      }
    },
    onError: () => setState("error"),
    onStatusChange: ({ status }: { status: string }) => {
      if (status === "connected") setState("live");
      if (status === "disconnected") setState((s) => (s === "live" ? "ended" : s));
    },
  });

  const startDemo = useCallback(() => {
    setState("demo");
    const mock = createMockConversation({
      lang,
      onMessage: pushLine,
      onToolCall: clientToolHandlers,
      delayMs: 500,
    });
    mockRef.current = mock;
    mock.start();
  }, [lang, pushLine, clientToolHandlers]);

  const begin = async () => {
    setState("connecting");
    try {
      const res = await fetch("/api/elevenlabs/signed-url");
      if (res.status === 503) {
        startDemo();
        return;
      }
      if (!res.ok) throw new Error(`signed-url ${res.status}`);
      const { signedUrl } = (await res.json()) as { signedUrl: string };
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // The SDK opens its own stream; release this one immediately.
      stream.getTracks().forEach((track) => track.stop());
      await conversation.startSession({
        signedUrl,
        overrides: { agent: { language: lang } },
      });
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "NotFoundError")
      ) {
        setState("error-mic");
      } else {
        setState("error");
      }
    }
  };

  const end = () => {
    mockRef.current?.end();
    mockRef.current = null;
    stopPlayback();
    try {
      conversation.endSession();
    } catch {
      /* not connected */
    }
    setState("ended");
  };

  const close = useCallback(() => {
    end();
    onClose();
  }, [onClose]);

  // Focus trap + Esc, active in every state while the dialog is open.
  useEffect(() => {
    const root = dialogRef.current;
    if (state === "consent") {
      root?.querySelector<HTMLElement>("input, button")?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && root) {
        const focusables = root.querySelectorAll<HTMLElement>(
          "input, button, a[href]",
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !root.contains(document.activeElement))
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !root.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close]);

  // Synthetic playback timers: all ids are kept so they can be cancelled;
  // a generation counter invalidates callbacks from earlier playbacks.
  const playbackTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playbackGen = useRef(0);

  const stopPlayback = useCallback(() => {
    playbackGen.current += 1;
    for (const id of playbackTimers.current) clearTimeout(id);
    playbackTimers.current = [];
  }, []);

  useEffect(
    () => () => {
      mockRef.current?.end();
      stopPlayback();
    },
    [stopPlayback],
  );

  const playSynthetic = (id: string) => {
    const script = SYNTHETIC_CONVERSATIONS.find((c) => c.id === id);
    const mock = mockRef.current;
    if (!script || !mock) return;
    mock.setLang(script.lang);
    stopPlayback();
    const gen = playbackGen.current;
    let delay = 0;
    for (const line of script.lines) {
      const d = delay;
      delay += line.role === "user" ? 300 : 1400;
      const timer = setTimeout(() => {
        if (gen !== playbackGen.current) return;
        pushLine({ role: line.role, text: line.text });
        line.tools?.forEach((tool) =>
          clientToolHandlers(tool.name, tool.parameters),
        );
      }, d + (line.role === "agent" ? 500 : 0));
      playbackTimers.current.push(timer);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-4 sm:items-center"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("voice.title")}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-bone p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("voice.title")}</h2>
          <button
            type="button"
            onClick={close}
            className="min-h-11 min-w-11 rounded-md text-2xl leading-none hover:bg-cream"
            aria-label={t("voice.close")}
          >
            ×
          </button>
        </div>

        {state === "consent" && (
          <div className="mt-4 space-y-4">
            <h3 className="font-semibold">{t("voice.consent.title")}</h3>
            <p className="text-sm text-charcoal/80">{t("voice.consent.ai")}</p>
            <p className="text-sm text-charcoal/80">
              {t("voice.consent.processing")}
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#F28C33]"
              />
              {t("voice.consent.agree")}
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={keepTranscript}
                onChange={(e) => setKeepTranscript(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#F28C33]"
              />
              {t("voice.consent.transcript")}
            </label>
            <a href="#privacy" className="block text-sm underline">
              {t("voice.consent.privacy")}
            </a>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={!agree}
                onClick={begin}
                className="min-h-12 flex-1 rounded-full bg-brand px-5 font-bold text-charcoal disabled:opacity-40"
              >
                {t("voice.consent.start")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-full bg-cream px-5 font-semibold"
              >
                {t("voice.consent.cancel")}
              </button>
            </div>
          </div>
        )}

        {state === "connecting" && (
          <div
            className="mt-6 flex items-center gap-3"
            aria-live="polite"
            role="status"
          >
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal/20 border-t-brand"
              aria-hidden="true"
            />
            {t("voice.connecting")}
          </div>
        )}

        {state === "demo" && (
          <p
            className="mt-4 rounded-md bg-sunny/40 px-3 py-2 text-sm font-semibold"
            role="status"
          >
            {t("voice.demo.banner")}
          </p>
        )}

        {(state === "live" || state === "demo") && (
          <p className="mt-3 text-sm font-semibold text-charcoal/70" aria-live="polite">
            {state === "live" ? t("voice.live") : null}
          </p>
        )}

        {(state === "live" || state === "demo" || state === "ended") && (
          <>
            <div
              className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-md bg-white p-3"
              aria-live="polite"
              aria-label="transcript"
            >
              {lines.map((line, i) => (
                <div key={i}>
                  <p className="text-sm">
                    <strong>
                      {line.role === "agent" ? t("voice.lola") : t("voice.you")}:{" "}
                    </strong>
                    {line.text}
                  </p>
                  {line.sources && line.sources.length > 0 && (
                    <ul className="ms-4 mt-1 space-y-0.5 text-xs text-charcoal/70">
                      <li className="font-semibold">{t("voice.sources")}:</li>
                      {line.sources.map((s) => (
                        <li key={s.id}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-brand decoration-2 underline-offset-2"
                          >
                            {s.title[lang]}
                          </a>{" "}
                          <span className="text-charcoal/50">
                            ({t("source.reviewed")} {s.reviewedOn})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {state === "demo" && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && input.trim()) {
                        mockRef.current?.send(input.trim());
                        setInput("");
                      }
                    }}
                    placeholder={t("voice.demo.placeholder")}
                    className="min-h-11 flex-1 rounded-md border border-charcoal/20 px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (input.trim()) {
                        mockRef.current?.send(input.trim());
                        setInput("");
                      }
                    }}
                    className="min-h-11 rounded-md bg-charcoal px-4 text-sm font-semibold text-bone"
                  >
                    {t("voice.demo.send")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SYNTHETIC_CONVERSATIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => playSynthetic(c.id)}
                      className="min-h-11 rounded-full bg-cream px-3 text-xs font-semibold hover:bg-sunny/40"
                    >
                      {t("voice.demo.play")}: {c.label.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(state === "live" || state === "demo") && (
              <button
                type="button"
                onClick={end}
                className="mt-4 min-h-12 rounded-full bg-charcoal px-5 font-bold text-bone"
              >
                {t("voice.end")}
              </button>
            )}
          </>
        )}

        {state === "ended" && (
          <p className="mt-4 font-semibold" role="status">
            {t("voice.ended")}
          </p>
        )}

        {(state === "error" || state === "error-mic") && (
          <div className="mt-4 space-y-3" role="alert">
            <p className="text-sm font-semibold">
              {state === "error-mic"
                ? t("voice.error.mic")
                : t("voice.error.generic")}
            </p>
            <button
              type="button"
              onClick={() => setState("consent")}
              className="min-h-11 rounded-full bg-brand px-5 font-bold text-charcoal"
            >
              {t("voice.retry")}
            </button>
          </div>
        )}

        {handover && <div className="mt-4"><HandoverCard /></div>}

        <div className="mt-4 space-y-2 border-t border-charcoal/10 pt-3 text-xs text-charcoal/70">
          <p>{t("voice.minimisation")}</p>
          <a href="#handover" className="font-semibold underline">
            {t("voice.human")}
          </a>
        </div>
      </div>
    </div>
  );
}
