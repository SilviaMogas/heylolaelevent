import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LangProvider } from "@/components/lang-provider";
import { VoicePanelLauncher } from "@/components/voice/voice-panel";

function renderPanel() {
  return render(
    <LangProvider>
      <VoicePanelLauncher />
    </LangProvider>,
  );
}

describe("VoicePanel", () => {
  beforeEach(() => {
    // No env configured -> the route returns 503 in production; in tests we
    // stub fetch to reproduce that response.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "voice_unavailable", mock: true }), {
          status: 503,
        }),
      ),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shows consent before connecting and requires the agree checkbox", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /ask about adoption/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const start = screen.getByRole("button", { name: /start conversation/i });
    expect(start).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("checkbox", { name: /i agree to a voice conversation/i }),
    );
    expect(start).toBeEnabled();
  });

  it("falls back to demo mode on 503 with banner + handover link", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /ask about adoption/i }));
    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: /i agree to a voice conversation/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /start conversation/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/demo mode — synthetic answers/i),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: /talk to a human/i }),
    ).toBeInTheDocument();
  });
});
