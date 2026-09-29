"use client";

import { useState } from "react";
import { useLang } from "@/components/lang-provider";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function NewsletterSignup() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setStatus({ kind: "error", message: t("newsletter.error.consent") });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
          signup_url: window.location.href,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: data.error || t("newsletter.error.generic"),
        });
        return;
      }
      setStatus({ kind: "success" });
      setEmail("");
    } catch {
      setStatus({ kind: "error", message: t("newsletter.error.generic") });
    }
  }

  return (
    <section
      aria-labelledby="newsletter-title"
      className="rounded-xl border border-charcoal/10 bg-white p-5"
    >
      <h2 id="newsletter-title" className="font-bold">
        {t("newsletter.title")}
      </h2>
      <p className="mt-1 text-sm text-charcoal/70">{t("newsletter.body")}</p>
      {status.kind === "success" ? (
        <p className="mt-3 text-sm font-medium" role="status">
          {t("newsletter.success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3 space-y-2" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            {t("newsletter.email_label")}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.email_placeholder")}
              disabled={status.kind === "loading"}
              className="min-h-11 flex-1 rounded-full border border-charcoal/20 bg-cream px-4 text-sm text-charcoal outline-none focus:border-charcoal"
            />
            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="min-h-11 rounded-full bg-charcoal px-5 text-sm font-medium text-white transition hover:bg-charcoal/85 disabled:opacity-60"
            >
              {status.kind === "loading"
                ? t("newsletter.submitting")
                : t("newsletter.submit")}
            </button>
          </div>
          <label className="flex items-start gap-2 text-xs text-charcoal/70">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5"
            />
            <span>{t("newsletter.consent")}</span>
          </label>
          {status.kind === "error" && (
            <p className="text-xs text-red-700" role="alert">
              {status.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
