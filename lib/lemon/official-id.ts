/**
 * Lemon — guardrail copy for the "official ID" boundary.
 *
 * Dubai Municipality is the only authority that issues, changes or verifies
 * an official dog ID in Dubai. `assertNoOfficialIdClaim` scans any text the
 * agent (or a test) produced and returns the list of forbidden claims found.
 * An empty array means the text is clean.
 */
import type { Lang } from "./guidance";

const FORBIDDEN: RegExp[] = [
  // "HeyLola issues/provides/verifies/certifies/replaces ... official/dubai/id/..."
  /\bheylola\b[^.\n]{0,40}?\b(issues?|issued|provides?|provided|verifies|verified|certifies|replaces?)\b[^.\n]{0,40}?\b(official|dubai|municipality|id|licence|license|registration|microchip)\b/gi,
  // "official HeyLola id/registration/licence"
  /\bofficial\b[^.\n]{0,15}?\bheylola\b[^.\n]{0,15}?\b(id|registration|licence|license)\b/gi,
  // "HeyLola dog ID"
  /\bheylola\s+dog\s+id\b/gi,
  // Arabic: HeyLola تُصدر/تتحقق/توثق ... رسمي/بلدية/هوية/تسجيل
  /\bheylola\b[^.\n]{0,30}?(تُصدر|تصدر|تتحقق|توثق)[^.\n]{0,30}?(رسمي|بلدية|هوية|تسجيل)/gi,
];

// A match inside a negated context ("Never say HeyLola issues ...",
// "HeyLola does not issue ...", "لا تدّعي أن HeyLola تُصدر") is a
// disclaimer or a prohibition, not a claim — skip it.
const NEGATION = /not\b|n't\b|never\b|cannot\b|can't\b|لا/i;

function isNegated(text: string, match: RegExpMatchArray): boolean {
  const span = match[0];
  if (NEGATION.test(span)) return true;
  // Look back to the previous sentence boundary for negating verbs like
  // "never say/imply/claim", "do not", or Arabic "لا".
  const idx = match.index ?? 0;
  const before = text.slice(Math.max(0, idx - 120), idx);
  const lastSentence = before.slice(before.search(/[^.\n;:!?]*$/));
  return NEGATION.test(lastSentence);
}

export function assertNoOfficialIdClaim(text: string): string[] {
  const violations: string[] = [];
  for (const pattern of FORBIDDEN) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (!isNegated(text, match)) violations.push(match[0]);
    }
  }
  return violations;
}

export const OFFICIAL_ID_DISCLAIMER: Record<Lang, string> = {
  en: "Dubai Municipality handles official registration and records. HeyLola provides a separate profile to organise information and support care and access. HeyLola does not issue or verify an official Dubai dog ID.",
  ar: "بلدية دبي هي الجهة المسؤولة عن التسجيل الرسمي والسجلات. تقدّم HeyLola ملفاً منفصلاً لتنظيم المعلومات ودعم الرعاية والوصول. لا تُصدر HeyLola هوية رسمية للكلب في دبي ولا تتحقق منها.",
};
