"use client";

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
  const { t, lang } = useLang();
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
      <p className="text-charcoal/70">
        {AUTHORITY_CONTACT.apps.map((a) => a[lang]).join(" · ")}
      </p>
    </div>
  );
}

export function JourneyCard({
  journeyId,
  highlight,
  open,
  onOpenChange,
  index,
}: {
  journeyId: JourneyId;
  highlight?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: number;
}) {
  const { lang, t } = useLang();
  const guidance = getGuidance(journeyId, lang);
  const today = new Date();

  return (
    <article
      id={`journey-${journeyId}`}
      className={`rounded-2xl border-t-4 border-brand bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        highlight ? "ring-2 ring-brand/40" : ""
      }`}
    >
      <p className="text-xs font-black tracking-widest text-brand">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-1 text-lg font-bold">{guidance.journey.title[lang]}</h3>
      <p className="mt-1 text-sm text-charcoal/80">
        {guidance.journey.summary[lang]}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`steps-${journeyId}`}
        onClick={() => onOpenChange(!open)}
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
      <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-8">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 hidden -translate-y-1/2 border-t border-charcoal/10 sm:block"
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand px-2 py-0.5 text-xs font-black text-charcoal sm:block"
        >
          vs
        </span>
        <div>
          <h3 className="inline-block rounded-full bg-charcoal px-3 py-1 text-sm font-bold text-bone">
            {t("distinction.dm.title")}
          </h3>
          <p className="mt-2 text-sm text-charcoal/80">{t("distinction.dm.body")}</p>
        </div>
        <div>
          <h3 className="inline-block rounded-full bg-brand px-3 py-1 text-sm font-bold text-charcoal">
            {t("distinction.hl.title")}
          </h3>
          <p className="mt-2 text-sm text-charcoal/80">{t("distinction.hl.body")}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-charcoal/10 pt-3 text-sm">
        {OFFICIAL_ID_DISCLAIMER[lang]}
      </p>
    </section>
  );
}
