"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useLang } from "@/components/lang-provider";
import { createMockConversation } from "@/lib/mock-agent";
import type { MockConversation } from "@/lib/mock-agent";
import { SYNTHETIC_CONVERSATIONS } from "@/lib/demo/synthetic";
import { AUTHORITY_CONTACT } from "@/lib/lemon";
import type { JourneyId, Lang, Source } from "@/lib/lemon";
import { LolaOrb } from "@/components/lola-orb";
import type { LolaOrbState } from "@/components/lola-orb";

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
  pendingQuestion?: string | null;
  onPendingConsumed?: () => void;
}

function HandoverCard() {
  const { t, lang } = useLang();
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
        {AUTHORITY_CONTACT.apps.map((a) => a[lang]).join(" · ")}
      </p>
      <p className="mt-1 text-charcoal/70">
        {t("voice.handover.heylola")}
      </p>
    </div>
  );
}

export function VoicePanelLauncher({
  pendingQuestion,
  onPendingConsumed,
  ...events
}: PanelEvents) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // A suggestion chip was clicked — open the panel.
  useEffect(() => {
    if (pendingQuestion) setOpen(true);
  }, [pendingQuestion]);

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
        className="cta-pulse relative inline-flex min-h-14 items-center gap-3 rounded-full bg-brand px-7 text-lg font-bold text-charcoal shadow-lg shadow-brand/30 transition hover:scale-[1.02] focus-visible:ring-4 ring-brand/40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
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
          <VoicePanelInner
            {...events}
            pendingQuestion={pendingQuestion}
            onPendingConsumed={onPendingConsumed}
            onClose={() => setOpen(false)}
          />
        </ConversationProvider>
      )}
    </>
  );
}

function StatusPill({ state }: { state: PanelState }) {
  const { t } = useLang();
  if (state === "connecting") {
    return (
      <span
        role="status"
        className="rounded-full bg-charcoal/10 px-3 py-1 text-xs font-semibold text-charcoal/70"
      >
        {t("voice.status.connecting")}
      </span>
    );
  }
  if (state === "live") {
    return (
      <span
        role="status"
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        {t("voice.status.live")}
      </span>
    );
  }
  if (state === "demo") {
    return (
      <span
        role="status"
        className="rounded-full bg-sunny/40 px-3 py-1 text-xs font-semibold text-charcoal"
      >
        {t("voice.status.demo")}
      </span>
    );
  }
  return null;
}

function VoicePanelInner({
  onClose,
  onShowSources,
  onOpenProfileGuide,
  pendingQuestion,
  onPendingConsumed,
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
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pendingSent = useRef(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- end() reads only refs and stable setters
  }, [onClose]);

  // Forward a pending suggestion-chip question once connected, exactly once.
  useEffect(() => {
    if (!pendingQuestion || pendingSent.current) return;
    if (state === "demo") {
      pendingSent.current = true;
      mockRef.current?.send(pendingQuestion);
      onPendingConsumed?.();
    } else if (state === "live") {
      pendingSent.current = true;
      pushLine({ role: "user", text: pendingQuestion });
      conversation.sendUserMessage(pendingQuestion);
      onPendingConsumed?.();
    }
  }, [state, pendingQuestion, pushLine, conversation, onPendingConsumed]);

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
          "input, button, a[href], summary",
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

  // Auto-scroll transcript to the latest line.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

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

  const sendTyped = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (state === "demo") {
      mockRef.current?.send(text);
    } else if (state === "live") {
      pushLine({ role: "user", text });
      conversation.sendUserMessage(text);
    }
  };

  const orbState: LolaOrbState =
    state === "connecting"
      ? "thinking"
      : state === "live"
        ? conversation.isSpeaking
          ? "speaking"
          : "listening"
        : "idle";

  const isMuted = conversation.isMuted ?? false;

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
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-bone shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-charcoal/10 px-5 py-4">
          <LolaOrb size="sm" state={orbState} />
          <h2 className="text-lg font-bold">{t("voice.title")}</h2>
          <span className="ms-auto flex items-center gap-2">
            <StatusPill state={state} />
            <button
              type="button"
              onClick={close}
              className="min-h-11 min-w-11 rounded-md text-2xl leading-none hover:bg-cream"
              aria-label={t("voice.close")}
            >
              ×
            </button>
          </span>
        </div>

        <div className="overflow-y-auto">
          {state === "consent" && (
            <div className="space-y-4 px-5 py-5">
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
            <div className="flex items-center gap-3 px-5 py-6" aria-live="polite">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal/20 border-t-brand"
                aria-hidden="true"
              />
              {t("voice.connecting")}
            </div>
          )}

          {(state === "live" || state === "demo" || state === "ended") && (
            <>
              <div
                ref={transcriptRef}
                className="max-h-72 space-y-3 overflow-y-auto px-5 py-4"
                aria-live="polite"
                aria-label="transcript"
              >
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.role === "user"
                        ? "ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-charcoal px-4 py-2.5 text-sm text-bone"
                        : "me-auto max-w-[85%] rounded-2xl rounded-es-sm border border-charcoal/10 bg-white px-4 py-2.5 text-sm shadow-sm"
                    }
                  >
                    <p>
                      <span className="sr-only">
                        {line.role === "agent" ? "Lola:" : "You:"}{" "}
                      </span>
                      {line.text}
                    </p>
                    {line.sources && line.sources.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {line.sources.map((s) => (
                          <li key={s.id}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded-full bg-cream px-2.5 py-1 text-xs hover:bg-sunny/40"
                            >
                              {s.title[lang]} ({t("source.reviewed")}{" "}
                              {s.reviewedOn})
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {state === "live" && conversation.isSpeaking && (
                  <div
                    className="me-auto flex h-6 items-end gap-1 px-2"
                    aria-hidden="true"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 animate-[bars_0.9s_ease-in-out_infinite] rounded-full bg-brand"
                        style={{
                          height: "100%",
                          transformOrigin: "bottom",
                          animationDelay: `${i * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {(state === "live" || state === "demo") && (
                <div className="flex items-center gap-2 px-5 pb-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendTyped();
                    }}
                    placeholder={t("voice.demo.placeholder")}
                    className="min-h-11 flex-1 rounded-full border border-charcoal/20 px-4 text-sm"
                  />
                  <button
                    type="button"
                    onClick={sendTyped}
                    aria-label={t("voice.demo.send")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-charcoal hover:bg-sunny"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                  {state === "live" && (
                    <button
                      type="button"
                      onClick={() => conversation.setMuted(!isMuted)}
                      aria-label={t(isMuted ? "voice.unmute" : "voice.mute")}
                      aria-pressed={isMuted}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-charcoal hover:bg-sunny/40"
                    >
                      {isMuted ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="9" y="3" width="6" height="11" rx="3" />
                          <path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="9" y="3" width="6" height="11" rx="3" />
                          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              )}

              {state === "demo" && (
                <details className="px-5 pb-2">
                  <summary className="min-h-11 cursor-pointer text-sm font-semibold text-charcoal/80">
                    {t("voice.demo.scripts")}
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SYNTHETIC_CONVERSATIONS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => playSynthetic(c.id)}
                        className="min-h-11 rounded-full bg-cream px-3 text-xs font-semibold hover:bg-sunny/40"
                      >
                        {t("voice.demo.play")}: {c.label[lang]}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          {state === "ended" && (
            <p className="px-5 py-4 font-semibold" role="status">
              {t("voice.ended")}
            </p>
          )}

          {(state === "error" || state === "error-mic") && (
            <div className="space-y-3 px-5 py-4" role="alert">
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

          {handover && (
            <div className="px-5 pb-2">
              <HandoverCard />
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2 border-t border-charcoal/10 px-5 py-4 text-xs text-charcoal/70">
          <div className="flex items-center justify-between gap-3">
            <p>{t("voice.minimisation")}</p>
            {(state === "live" || state === "demo") && (
              <button
                type="button"
                onClick={end}
                className="min-h-11 shrink-0 rounded-full bg-charcoal px-5 text-sm font-bold text-bone"
              >
                {t("voice.end")}
              </button>
            )}
          </div>
          <a href="#handover" className="inline-block font-semibold underline">
            {t("voice.human")}
          </a>
        </div>
      </div>
    </div>
  );
}
