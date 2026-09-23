"use client";

import { useLang } from "@/components/lang-provider";
import { LANGS } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";

export function SiteHeader() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="border-b border-charcoal/10 bg-bone">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
        <Wordmark />
        <span className="rounded-full bg-cream px-3 py-1 text-xs text-charcoal/70">
          {t("header.badge")}
        </span>
        <div
          className="ms-auto flex items-center gap-1"
          role="group"
          aria-label={t("header.langLabel")}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`min-h-11 min-w-11 rounded-md px-3 text-sm font-semibold ${
                lang === l
                  ? "bg-charcoal text-bone"
                  : "bg-transparent text-charcoal hover:bg-cream"
              }`}
            >
              {t(`header.lang.${l}`)}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
