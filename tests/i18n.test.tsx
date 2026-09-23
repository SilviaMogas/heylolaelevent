import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { dict, dir } from "@/lib/i18n";
import { LangProvider, useLang } from "@/components/lang-provider";

function Probe() {
  const { t, setLang } = useLang();
  return (
    <div>
      <span data-testid="label">{t("hero.title")}</span>
      <button onClick={() => setLang("ar")}>to-ar</button>
    </div>
  );
}

describe("i18n", () => {
  it("has en/ar key parity", () => {
    expect(Object.keys(dict.en).sort()).toEqual(Object.keys(dict.ar).sort());
    for (const key of Object.keys(dict.en)) {
      expect(dict.ar[key]).toBeTruthy();
    }
  });

  it('dir("ar") is rtl', () => {
    expect(dir("ar")).toBe("rtl");
    expect(dir("en")).toBe("ltr");
  });

  it("toggle updates <html> lang/dir and rendered label", () => {
    render(
      <LangProvider>
        <Probe />
      </LangProvider>,
    );
    fireEvent.click(screen.getByText("to-ar"));
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByTestId("label").textContent).toBe(dict.ar["hero.title"]);
  });
});
