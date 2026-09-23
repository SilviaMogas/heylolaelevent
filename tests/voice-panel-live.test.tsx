import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LangProvider } from "@/components/lang-provider";
import { VoicePanelLauncher } from "@/components/voice/voice-panel";

const sendUserMessage = vi.fn();
const startSession = vi.fn(async (opts?: unknown) => opts);

vi.mock("@elevenlabs/react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@elevenlabs/react")>();
  return {
    ...actual,
    useConversation: (options?: {
      onStatusChange?: (s: { status: string }) => void;
    }) => ({
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
    }),
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

describe("VoicePanel — pending question & live mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("sends a pending suggestion question once in demo mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: "voice_unavailable", mock: true }),
          { status: 503 },
        ),
      ),
    );
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

  it("routes typed messages through sendUserMessage in live mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ signedUrl: "wss://x" }), { status: 200 }),
      ),
    );
    const stop = vi.fn();
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi
          .fn()
          .mockResolvedValue({ getTracks: () => [{ stop }] }),
      },
    });

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /ask about adoption/i }));
    await consentAndStart();

    await waitFor(() =>
      expect(screen.getByText(/live · elevenlabs/i)).toBeInTheDocument(),
    );
    expect(startSession).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();

    const input = screen.getByPlaceholderText(/type a question for lola/i);
    fireEvent.change(input, { target: { value: "tell me about microchipping" } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    expect(sendUserMessage).toHaveBeenCalledWith("tell me about microchipping");
    expect(
      screen.getByText("tell me about microchipping"),
    ).toBeInTheDocument();
  });
});
