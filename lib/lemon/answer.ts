/**
 * Lemon — answer composition.
 *
 * Pure functions that turn the reviewed guidance into what the agent or the
 * UI may say. The only way the module "answers" is by quoting journey steps;
 * anything else becomes a handover to Dubai Municipality.
 */
import { getJourney, JOURNEYS } from "./guidance";
import type { JourneyId, Lang, Step } from "./guidance";
import { getSource, isStale } from "./sources";
import type { Source } from "./sources";

export const AUTHORITY_CONTACT = {
  name: { en: "Dubai Municipality", ar: "بلدية دبي" },
  phone: "800 900",
  url: "https://www.dm.gov.ae/",
  apps: ["Dubai Municipality app", "DubaiNow", "Aleef"],
} as const;

export interface AnsweredStep {
  step: Step;
  sources: Source[];
  stale: boolean;
  needsAuthority: boolean;
}

export interface JourneyGuidance {
  journey: ReturnType<typeof getJourney>;
  steps: AnsweredStep[];
  authorityContact: typeof AUTHORITY_CONTACT;
}

export function getGuidance(
  journeyId: JourneyId,
  _lang: Lang,
  today: Date = new Date(),
): JourneyGuidance {
  const journey = getJourney(journeyId);
  return {
    journey,
    authorityContact: AUTHORITY_CONTACT,
    steps: journey.steps.map((step) => {
      const sources = step.sourceIds.map((id) => getSource(id));
      const stale = sources.some((s) => isStale(s, today));
      return {
        step,
        sources,
        stale,
        needsAuthority: step.verification === "unverified" || stale,
      };
    }),
  };
}

const KEYWORDS: Record<JourneyId, Record<Lang, RegExp>> = {
  adopt: {
    en: /\b(adopt|adoption|shelter|rescue)\b/i,
    ar: /تبن|ملجأ/,
  },
  register: {
    en: /\b(microchip|chip|register|registration|tag|municipality)\b/i,
    ar: /شريحة|تسجيل|بلدية/,
  },
  profile: {
    en: /\b(profile|heylola|records|documents|organise|organize)\b/i,
    ar: /ملف|سجلات/,
  },
};

const JOURNEY_ORDER: JourneyId[] = ["adopt", "register", "profile"];

export function findJourney(utterance: string, lang: Lang): JourneyId | null {
  for (const id of JOURNEY_ORDER) {
    if (KEYWORDS[id][lang].test(utterance)) return id;
  }
  // Fall back to the other language's keywords — a stray Arabic word in an
  // English sentence should still route somewhere sensible.
  const other: Lang = lang === "en" ? "ar" : "en";
  for (const id of JOURNEY_ORDER) {
    if (KEYWORDS[id][other].test(utterance)) return id;
  }
  return null;
}

export const HANDOVER_TEXT: Record<Lang, string> = {
  en: "I can't verify that. Please check with Dubai Municipality directly: call 800 900 (toll-free, 24/7), visit www.dm.gov.ae, or use the Dubai Municipality, DubaiNow or Aleef apps.",
  ar: "لا أستطيع التحقق من ذلك. يُرجى التواصل مع بلدية دبي مباشرة: اتصل بـ 800 900 (مجاني، على مدار الساعة)، أو زر www.dm.gov.ae، أو استخدم تطبيقات بلدية دبي أو دبي الآن أو أليف.",
};

const REPORTED_SUFFIX: Record<Lang, string> = {
  en: " (reported — confirm with Dubai Municipality)",
  ar: " (منقول — أكّد مع بلدية دبي)",
};

const UNVERIFIED_SUFFIX: Record<Lang, string> = {
  en: " (we could not verify this — ask Dubai Municipality)",
  ar: " (لم نتمكّن من التحقق من هذا — اسأل بلدية دبي)",
};

export interface ComposedAnswer {
  text: string;
  sources: Source[];
  handover: boolean;
}

export function composeAnswer(
  journeyId: JourneyId | null,
  lang: Lang,
  today: Date = new Date(),
): ComposedAnswer {
  if (journeyId === null) {
    return { text: HANDOVER_TEXT[lang], sources: [], handover: true };
  }

  const journey = getJourney(journeyId);
  const lines: string[] = [journey.summary[lang]];
  const sources = new Map<string, Source>();
  let anyUnverified = false;

  for (const step of journey.steps.slice(0, 3)) {
    let line = step.title[lang];
    if (step.verification === "reported") line += REPORTED_SUFFIX[lang];
    if (step.verification === "unverified") {
      line += UNVERIFIED_SUFFIX[lang];
      anyUnverified = true;
    }
    lines.push(`- ${line}`);
    for (const id of step.sourceIds) {
      const s = getSource(id);
      sources.set(s.id, s);
      if (isStale(s, today)) anyUnverified = true;
    }
  }

  return {
    text: lines.join("\n"),
    sources: [...sources.values()],
    handover: anyUnverified,
  };
}

export { JOURNEYS };
