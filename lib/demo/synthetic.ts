/**
 * Scripted demo conversations for the voice panel's "Play demo" buttons.
 * Every agent line is checked by tests against assertNoOfficialIdClaim.
 */
import { OFFICIAL_ID_DISCLAIMER } from "@/lib/lemon/official-id";

export interface SyntheticLine {
  role: "agent" | "user";
  text: string;
  tools?: Array<{ name: string; parameters: Record<string, unknown> }>;
}

export interface SyntheticConversation {
  id: string;
  label: { en: string; ar: string };
  lang: "en" | "ar";
  lines: SyntheticLine[];
}

export const SYNTHETIC_CONVERSATIONS: SyntheticConversation[] = [
  {
    id: "en-adopt",
    label: { en: "EN — adopting a dog", ar: "EN — تبنّي كلب" },
    lang: "en",
    lines: [
      { role: "user", text: "How can I adopt a dog in Dubai?" },
      {
        role: "agent",
        text: "Two legitimate routes: Dubai Municipality's own adoption service via e-services, DubaiNow or the Aleef app, or a licensed shelter (reported — confirm with Dubai Municipality). Whichever route you take, the dog must end up registered with Dubai Municipality in your name.",
        tools: [{ name: "show_sources", parameters: { journey: "adopt" } }],
      },
      { role: "user", text: "What does it cost?" },
      {
        role: "agent",
        text: "Press reports list roughly Dh150 vaccination, Dh50 microchip and Dh10 registration plus a Dh20 knowledge fee — but those are reported figures, please confirm the current amounts with Dubai Municipality on 800 900.",
        tools: [{ name: "show_sources", parameters: { journey: "adopt" } }],
      },
    ],
  },
  {
    id: "en-register-id",
    label: { en: "EN — registration & official ID", ar: "EN — التسجيل والهوية الرسمية" },
    lang: "en",
    lines: [
      { role: "user", text: "How do I register and microchip my dog?" },
      {
        role: "agent",
        text: "A vet implants an ISO microchip, vaccination must be current, then you apply through the 'Register pets and farm animals' e-service with UAE PASS — or call 800 900. Dubai Municipality issues the registration and tag (reported — confirm with Dubai Municipality).",
        tools: [{ name: "show_sources", parameters: { journey: "register" } }],
      },
      { role: "user", text: "Does HeyLola give me an official ID?" },
      {
        role: "agent",
        text: OFFICIAL_ID_DISCLAIMER.en,
      },
    ],
  },
  {
    id: "ar-register-profile",
    label: { en: "AR — registration then profile", ar: "AR — التسجيل ثم الملف" },
    lang: "ar",
    lines: [
      { role: "user", text: "كيف أسجّل كلبي؟" },
      {
        role: "agent",
        text: "يزرع الطبيب البيطري شريحة ISO، وتكون التطعيمات محدّثة، ثم تقدّم الطلب عبر خدمة «تسجيل الحيوانات الأليفة وحيوانات المزارع» بالهوية الرقمية أو اتصل بـ 800 900 (منقول — أكّد مع بلدية دبي).",
        tools: [{ name: "show_sources", parameters: { journey: "register" } }],
      },
      { role: "user", text: "وكيف أنظّم السجلات؟" },
      {
        role: "agent",
        text: "أنشئ ملفاً للكلب في HeyLola وسجّل رقم الشريحة ورقم تسجيل بلدية دبي كمراجع. السجل الرسمي يبقى لدى بلدية دبي — HeyLola منظّم خاص وليست سجلاً رسمياً.",
        tools: [
          { name: "show_sources", parameters: { journey: "profile" } },
          { name: "open_profile_guide", parameters: {} },
        ],
      },
    ],
  },
  {
    id: "en-unverified",
    label: { en: "EN — unverified question → handover", ar: "EN — سؤال غير مؤكد → تحويل" },
    lang: "en",
    lines: [
      { role: "user", text: "What's the fine if I don't register?" },
      {
        role: "agent",
        text: "I can't verify that — I couldn't confirm the current penalty amounts on an official Dubai Municipality page. Please check with Dubai Municipality directly: call 800 900 (toll-free, 24/7), visit www.dm.gov.ae, or use the Dubai Municipality, DubaiNow or Aleef apps.",
        tools: [
          { name: "request_handover", parameters: { reason: "penalty amounts unverified" } },
        ],
      },
    ],
  },
];
