"use client";

import { useState } from "react";
import { useLang } from "@/components/lang-provider";
import {
  AUTHORITY_CONTACT,
  getGuidance,
  isStale,
  OFFICIAL_ID_DISCLAIMER,
} from "@/lib/lemon";
import type { JourneyId, Verification } from "@/lib/lemon";

const CHIP_STYLE: Record<Verification, string> = {
  official: "bg-charcoal text-bone",
  reported: "bg-sunny/60 text-charcoal",
  unverified: "bg-brand/20 text-charcoal ring-1 ring-brand",
};

export function AuthorityBlock() {
  const { t } = useLang();
  return (
    <div className="mt-3 rounded-md bg-cream p-3 text-sm">
      <p className="font-semibold">{t("authority.contactHeading")}</p>
      <p>
        {AUTHORITY_CONTACT.name.en} —{" "}
        <a className="underline" href={`tel:${AUTHORITY_CONTACT.phone.replace(/\s/g, "")}`}>
          {AUTHORITY_CONTACT.phone}
        </a>{" "}
        —{" "}
        <a className="underline" href={AUTHORITY_CONTACT.url} target="_blank" rel="noopener noreferrer">
          dm.gov.ae
        </a>
      </p>
      <p className="text-charcoal/70">{AUTHORITY_CONTACT.apps.join(" · ")}</p>
    </div>
  );
}

export function JourneyCard({
  journeyId,
  highlight,
}: {
  journeyId: JourneyId;
  highlight?: boolean;
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const guidance = getGuidance(journeyId, lang);
  const today = new Date();

  return (
    <article
      id={`journey-${journeyId}`}
      className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow ${
        highlight ? "border-brand ring-2 ring-brand/40" : "border-charcoal/10"
      }`}
    >
      <h3 className="text-lg font-bold">{guidance.journey.title[lang]}</h3>
      <p className="mt-1 text-sm text-charcoal/80">
        {guidance.journey.summary[lang]}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`steps-${journeyId}`}
        onClick={() => setOpen((o) => !o)}
        className="mt-3 min-h-11 rounded-md bg-cream px-4 text-sm font-semibold hover:bg-sunny/40"
      >
        {t("journeys.steps")} ({guidance.steps.length})
      </button>
      {open && (
        <ol id={`steps-${journeyId}`} className="mt-4 space-y-4">
          {guidance.steps.map(({ step, sources }) => (
            <li key={step.id} className="border-s-2 border-charcoal/15 ps-3">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold">{step.title[lang]}</h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CHIP_STYLE[step.verification]}`}
                >
                  {t(`verification.${step.verification}`)}
                </span>
                <span className="rounded-full bg-cream px-2 py-0.5 text-xs">
                  {t(`authority.${step.authority}`)}
                </span>
              </div>
              <p className="mt-1 text-sm text-charcoal/80">{step.body[lang]}</p>
              {sources.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {sources.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-charcoal underline decoration-brand decoration-2 underline-offset-2"
                      >
                        {s.publisher}
                      </a>
                      <span className="text-charcoal/60">
                        {t("source.reviewed")} {s.reviewedOn}
                      </span>
                      {isStale(s, today) && (
                        <span className="rounded-full bg-brand/20 px-2 py-0.5 font-semibold">
                          {t("source.stale")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {step.verification === "unverified" && <AuthorityBlock />}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export function DistinctionBanner() {
  const { t, lang } = useLang();
  return (
    <section
      aria-label="Dubai Municipality vs HeyLola"
      className="rounded-xl border border-charcoal/10 bg-cream p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="font-bold">{t("distinction.dm.title")}</h3>
          <p className="text-sm text-charcoal/80">{t("distinction.dm.body")}</p>
        </div>
        <div>
          <h3 className="font-bold">{t("distinction.hl.title")}</h3>
          <p className="text-sm text-charcoal/80">{t("distinction.hl.body")}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-charcoal/10 pt-3 text-sm">
        {OFFICIAL_ID_DISCLAIMER[lang]}
      </p>
    </section>
  );
}
