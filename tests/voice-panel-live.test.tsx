import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LangProvider } from "@/components/lang-provider";
import { VoicePanelLauncher } from "@/components/voice/voice-panel";

const sendUserMessage = vi.fn();
const startSession = vi.fn(async (opts?: unknown) => opts);
let capturedOptions: {
  onStatusChange?: (s: { status: string }) => void;
  onMessage?: (m: { message?: string; source?: string }) => void;
} = {};

vi.mock("@elevenlabs/react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@elevenlabs/react")>();
  return {
    ...actual,
    useConversation: (options?: typeof capturedOptions) => {
      capturedOptions = options ?? {};
      return {
        status: "connected",
        isSpeaking: false,
        isMuted: false,
        setMuted: vi.fn(),
        startSession: async (opts: unknown) => {
          startSession(opts);
          options?.onStatusChange?.({ status: "connected" });
        },
        endSession: vi.fn(),
        sendUserMessage,
      };
    },
  };
});

function renderPanel(props: {
  pendingQuestion?: string | null;
  onPendingConsumed?: () => void;
} = {}) {
  return render(
    <LangProvider>
      <VoicePanelLauncher {...props} />
    </LangProvider>,
  );
}

async function consentAndStart() {
  fireEvent.click(
    await screen.findByRole("checkbox", {
      name: /i agree to a voice conversation/i,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: /start conversation/i }));
}

function stubFetchResponse(body: unknown, status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status }),
    ),
  );
}

const stubUnavailable = () =>
  stubFetchResponse({ error: "voice_unavailable", mock: true }, 503);

const stubSignedUrl = () => stubFetchResponse({ signedUrl: "wss://x" }, 200);

function stubMic() {
  const stop = vi.fn();
  vi.stubGlobal("navigator", {
    ...navigator,
    mediaDevices: {
      getUserMedia: vi
        .fn()
        .mockResolvedValue({ getTracks: () => [{ stop }] }),
    },
  });
  return stop;
}

async function startLivePanel() {
  renderPanel();
  fireEvent.click(screen.getByRole("button", { name: /ask about adoption/i }));
  await consentAndStart();
  await waitFor(() =>
    expect(screen.getByText(/live · elevenlabs/i)).toBeInTheDocument(),
  );
}

function typeAndSend(text: string) {
  fireEvent.change(screen.getByPlaceholderText(/type a question for lola/i), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /^send$/i }));
}

describe("VoicePanel — pending question & live mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("sends a pending suggestion question once in demo mode", async () => {
    stubUnavailable();
    const consumed = vi.fn();
    renderPanel({
      pendingQuestion: "how do I register my dog",
      onPendingConsumed: consumed,
    });

    // The launcher auto-opened the dialog.
    await screen.findByRole("dialog");
    await consentAndStart();

    await waitFor(() =>
      expect(screen.getByText("how do I register my dog")).toBeInTheDocument(),
    );
    await waitFor(() => expect(consumed).toHaveBeenCalled());
    // Lola's answer (register journey summary) follows.
    await waitFor(() =>
      expect(
        screen.getByText(/only body that registers dogs in Dubai/i),
      ).toBeInTheDocument(),
    );
  });

  it("clears a pending question when the panel is closed from consent", async () => {
    stubUnavailable();
    const consumed = vi.fn();
    renderPanel({ pendingQuestion: "X", onPendingConsumed: consumed });

    await screen.findByRole("dialog");
    // Decline / close from the consent screen.
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(consumed).toHaveBeenCalled();
  });

  it("routes typed messages through sendUserMessage in live mode", async () => {
    stubSignedUrl();
    const stop = stubMic();
    await startLivePanel();

    expect(startSession).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();

    typeAndSend("tell me about microchipping");

    expect(sendUserMessage).toHaveBeenCalledWith("tell me about microchipping");
    expect(
      screen.getByText("tell me about microchipping"),
    ).toBeInTheDocument();
  });

  it("dedupes SDK echoes of locally-sent user text", async () => {
    stubSignedUrl();
    stubMic();
    await startLivePanel();

    typeAndSend("hello");
    expect(sendUserMessage).toHaveBeenCalledWith("hello");

    // SDK echoes our own text back — must not produce a second bubble.
    capturedOptions.onMessage?.({ message: "hello", source: "user" });
    expect(screen.getAllByText("hello")).toHaveLength(1);

    // A genuinely new user message still renders.
    capturedOptions.onMessage?.({ message: "other", source: "user" });
    await waitFor(() =>
      expect(screen.getByText("other")).toBeInTheDocument(),
    );
  });
});
