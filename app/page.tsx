"use client";

import { useCallback, useState } from "react";
import { useLang } from "@/components/lang-provider";
import { SiteHeader } from "@/components/site-header";
import { DistinctionBanner, JourneyCard } from "@/components/journey-card";
import { VoicePanelLauncher } from "@/components/voice/voice-panel";
import { AUTHORITY_CONTACT, SOURCES } from "@/lib/lemon";
import type { JourneyId } from "@/lib/lemon";

const JOURNEY_IDS: JourneyId[] = ["adopt", "register", "profile"];

export default function Home() {
  const { t, lang } = useLang();
  const [highlighted, setHighlighted] = useState<JourneyId | null>(null);
  const [openCards, setOpenCards] = useState<Record<JourneyId, boolean>>({
    adopt: false,
    register: false,
    profile: false,
  });

  const showSources = useCallback((journey: JourneyId) => {
    setHighlighted(journey);
    setOpenCards((prev) => ({ ...prev, [journey]: true }));
    document
      .getElementById(`journey-${journey}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const openProfileGuide = useCallback(() => showSources("profile"), [showSources]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-6 py-8">
        <section className="space-y-4">
          <h1 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-charcoal/80">{t("brand.tagline")}</p>
          <VoicePanelLauncher
            onShowSources={showSources}
            onOpenProfileGuide={openProfileGuide}
          />
          <p className="text-sm text-charcoal/60">{t("hero.aiDisclosure")}</p>
        </section>

        <DistinctionBanner />

        <section aria-labelledby="journeys-heading" className="space-y-4">
          <h2 id="journeys-heading" className="text-2xl font-bold">
            {t("journeys.heading")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {JOURNEY_IDS.map((id) => (
              <JourneyCard
                key={id}
                journeyId={id}
                highlight={highlighted === id}
                open={openCards[id]}
                onOpenChange={(open) =>
                  setOpenCards((prev) => ({ ...prev, [id]: open }))
                }
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-charcoal/10 bg-white p-5">
          <h2 className="text-xl font-bold">{t("shelter.heading")}</h2>
          <p className="mt-2 text-sm text-charcoal/80">{t("shelter.body")}</p>
        </section>

        <section
          id="handover"
          className="scroll-mt-6 rounded-xl border border-charcoal/10 bg-white p-5"
        >
          <h2 className="text-xl font-bold">{t("handover.heading")}</h2>
          <p className="mt-2 text-sm text-charcoal/80">{t("handover.body")}</p>
          <p className="mt-3 text-sm">
            <strong>{AUTHORITY_CONTACT.name[lang]}</strong> —{" "}
            <a className="font-semibold underline" href="tel:800900">
              {AUTHORITY_CONTACT.phone}
            </a>{" "}
            —{" "}
            <a
              className="underline"
              href={AUTHORITY_CONTACT.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {AUTHORITY_CONTACT.url.replace("https://www.", "")}
            </a>
          </p>
          <p className="text-sm text-charcoal/70">
            {AUTHORITY_CONTACT.apps.map((a) => a[lang]).join(" · ")}
          </p>
          <p className="mt-3 text-sm text-charcoal/80">
            {t("voice.handover.heylola")}
          </p>
        </section>

        <section id="privacy" className="scroll-mt-6 rounded-xl bg-cream p-5">
          <h2 className="text-xl font-bold">{t("privacy.heading")}</h2>
          <p className="mt-2 text-sm text-charcoal/80">{t("privacy.body")}</p>
        </section>
      </main>

      <footer className="border-t border-charcoal/10 bg-cream">
        <div className="mx-auto max-w-6xl space-y-4 px-6 py-8">
          <h2 className="font-bold">{t("footer.sources")}</h2>
          <ul className="space-y-1 text-sm">
            {SOURCES.map((s) => (
              <li key={s.id} className="flex flex-wrap gap-2">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-brand decoration-2 underline-offset-2"
                >
                  {s.title[lang]}
                </a>
                <span className="text-charcoal/60">
                  {s.publisher} · {s.kind === "official" ? "official" : "secondary"} ·{" "}
                  {t("source.reviewed")} {s.reviewedOn}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            {t("footer.contact")}:{" "}
            <a href="mailto:hey@heylola.co" className="underline">
              hey@heylola.co
            </a>
          </p>
          <p className="text-xs text-charcoal/60">{t("footer.disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
}
