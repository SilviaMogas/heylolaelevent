import type { Lang } from "@/lib/lemon/guidance";

export type { Lang };

export const LANGS: Lang[] = ["en", "ar"];

export function dir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export const dict: Record<Lang, Record<string, string>> = {
  en: {
    "brand.tagline": "Your dog's lifestyle concierge.",
    "header.badge": "Challenge demo — not the HeyLola product",
    "header.lang.en": "EN",
    "header.lang.ar": "العربية",
    "header.langLabel": "Language",
    "hero.title": "Adopt a dog in Dubai, with the paperwork explained.",
    "hero.ask": "Ask about adoption in Dubai",
    "hero.aiDisclosure":
      "Lola is an AI assistant. Voice is processed by ElevenLabs.",
    "distinction.dm.title": "Dubai Municipality",
    "distinction.dm.body": "Official registration & records",
    "distinction.hl.title": "HeyLola",
    "distinction.hl.body":
      "A separate profile to organise info and support care & access",
    "journeys.heading": "The three journeys",
    "journeys.steps": "Steps",
    "verification.official": "Official",
    "verification.reported": "Reported — confirm with DM",
    "verification.unverified": "Not verified — ask DM",
    "authority.dubai_municipality": "Dubai Municipality",
    "authority.vet_clinic": "Vet clinic",
    "authority.shelter": "Licensed shelter",
    "authority.heylola": "HeyLola",
    "authority.you": "You",
    "source.reviewed": "Reviewed",
    "source.stale": "Needs re-check",
    "authority.contactHeading": "Authority contact",
    "shelter.heading": "Shelters are separate",
    "shelter.body":
      "Shelter & welfare referrals are separate from HeyLola. We do not list or partner with shelters; ask Dubai Municipality or a licensed shelter.",
    "voice.title": "Ask Lola",
    "voice.consent.title": "Before we start",
    "voice.consent.ai":
      "Lola is an AI assistant, not a person and not a government service.",
    "voice.consent.processing":
      "Your voice is sent to ElevenLabs for processing during the conversation. In demo mode nothing is recorded or sent.",
    "voice.consent.agree": "I agree to a voice conversation",
    "voice.consent.transcript":
      "Keep a transcript on this page for this session",
    "voice.consent.privacy": "Read the privacy & AI note",
    "voice.consent.start": "Start conversation",
    "voice.consent.cancel": "Cancel",
    "voice.connecting": "Connecting…",
    "voice.live": "Live — Lola can hear you",
    "voice.ended": "Conversation ended",
    "voice.end": "End conversation",
    "voice.retry": "Try again",
    "voice.close": "Close",
    "voice.error.mic":
      "Microphone access was denied. Allow the microphone in your browser and retry.",
    "voice.error.generic": "Something went wrong. Please try again.",
    "voice.demo.banner": "Demo mode — synthetic answers, no audio",
    "voice.demo.placeholder": "Type a question for Lola…",
    "voice.demo.send": "Send",
    "voice.demo.play": "Play demo",
    "voice.minimisation":
      "We don't ask for names, IDs or documents. Nothing is saved after you close this page.",
    "voice.human": "Talk to a human / official service",
    "voice.handover.title": "For anything Lola can't verify",
    "voice.handover.heylola":
      "For HeyLola profile questions only: hey@heylola.co",
    "voice.you": "You",
    "voice.lola": "Lola",
    "handover.heading": "Talk to a human or an official service",
    "handover.body":
      "Dubai Municipality handles official registration, records and any question Lola can't verify.",
    "privacy.heading": "Privacy & AI note",
    "privacy.body":
      "Lola is an AI assistant. Voice is processed by ElevenLabs when you consent to a live call; demo mode sends nothing. We ask for no names, IDs or documents, and nothing is stored after you close this page.",
    "footer.sources": "Sources & review dates",
    "footer.contact": "Contact",
    "footer.disclaimer":
      "Challenge demo. Not affiliated with Dubai Municipality. Not the HeyLola product.",
  },
  ar: {
    "brand.tagline": "كونسيرج أسلوب حياة كلبك.",
    "header.badge": "نسخة تجريبية — وليست منتج HeyLola",
    "header.lang.en": "EN",
    "header.lang.ar": "العربية",
    "header.langLabel": "اللغة",
    "hero.title": "تبنّ كلباً في دبي، مع شرح الأوراق الرسمية.",
    "hero.ask": "اسأل عن التبني في دبي",
    "hero.aiDisclosure": "لولا مساعدة ذكاء اصطناعي. يُعالَج الصوت عبر ElevenLabs.",
    "distinction.dm.title": "بلدية دبي",
    "distinction.dm.body": "التسجيل الرسمي والسجلات",
    "distinction.hl.title": "HeyLola",
    "distinction.hl.body": "ملف منفصل لتنظيم المعلومات ودعم الرعاية والوصول",
    "journeys.heading": "المسارات الثلاثة",
    "journeys.steps": "الخطوات",
    "verification.official": "رسمي",
    "verification.reported": "منقول — أكّد مع بلدية دبي",
    "verification.unverified": "غير مؤكد — اسأل بلدية دبي",
    "authority.dubai_municipality": "بلدية دبي",
    "authority.vet_clinic": "عيادة بيطرية",
    "authority.shelter": "ملجأ مرخّص",
    "authority.heylola": "HeyLola",
    "authority.you": "أنت",
    "source.reviewed": "رُوجع في",
    "source.stale": "يحتاج إعادة تحقق",
    "authority.contactHeading": "جهة الاتصال الرسمية",
    "shelter.heading": "الملاجئ منفصلة",
    "shelter.body":
      "إحالات الملاجئ ورعاية الحيوانات منفصلة عن HeyLola. لا نُدرج الملاجئ ولا نتعاون معها؛ اسأل بلدية دبي أو ملجأً مرخّصاً.",
    "voice.title": "اسأل لولا",
    "voice.consent.title": "قبل أن نبدأ",
    "voice.consent.ai":
      "لولا مساعدة ذكاء اصطناعي، وليست شخصاً ولا خدمة حكومية.",
    "voice.consent.processing":
      "يُرسَل صوتك إلى ElevenLabs للمعالجة أثناء المحادثة. في الوضع التجريبي لا يُسجَّل شيء ولا يُرسَل.",
    "voice.consent.agree": "أوافق على محادثة صوتية",
    "voice.consent.transcript": "احتفظ بنسخة نصية على هذه الصفحة لهذه الجلسة",
    "voice.consent.privacy": "اقرأ ملاحظة الخصوصية والذكاء الاصطناعي",
    "voice.consent.start": "ابدأ المحادثة",
    "voice.consent.cancel": "إلغاء",
    "voice.connecting": "جارٍ الاتصال…",
    "voice.live": "متصل — لولا تسمعك",
    "voice.ended": "انتهت المحادثة",
    "voice.end": "إنهاء المحادثة",
    "voice.retry": "حاول مجدداً",
    "voice.close": "إغلاق",
    "voice.error.mic":
      "رُفض الوصول إلى الميكروفون. اسمح بالميكروفون في متصفحك وأعد المحاولة.",
    "voice.error.generic": "حدث خطأ ما. حاول مرة أخرى.",
    "voice.demo.banner": "وضع تجريبي — إجابات مُعدّة، بلا صوت",
    "voice.demo.placeholder": "اكتب سؤالاً للولا…",
    "voice.demo.send": "أرسل",
    "voice.demo.play": "شغّل العرض",
    "voice.minimisation":
      "لا نطلب أسماء أو هويات أو مستندات. لا يُحفَظ شيء بعد إغلاق هذه الصفحة.",
    "voice.human": "تحدّث إلى إنسان / خدمة رسمية",
    "voice.handover.title": "لأي شيء لا تستطيع لولا التحقق منه",
    "voice.handover.heylola":
      "لأسئلة ملف HeyLola فقط: hey@heylola.co",
    "voice.you": "أنت",
    "voice.lola": "لولا",
    "handover.heading": "تحدّث إلى إنسان أو خدمة رسمية",
    "handover.body":
      "بلدية دبي مسؤولة عن التسجيل الرسمي والسجلات وعن أي سؤال لا تستطيع لولا التحقق منه.",
    "privacy.heading": "ملاحظة الخصوصية والذكاء الاصطناعي",
    "privacy.body":
      "لولا مساعدة ذكاء اصطناعي. يُعالَج الصوت عبر ElevenLabs عند موافقتك على مكالمة مباشرة؛ أما الوضع التجريبي فلا يرسل شيئاً. لا نطلب أسماء أو هويات أو مستندات، ولا يُخزَّن شيء بعد إغلاق هذه الصفحة.",
    "footer.sources": "المصادر وتواريخ المراجعة",
    "footer.contact": "تواصل",
    "footer.disclaimer":
      "نسخة تحدٍّ تجريبية. لا صلة لها ببلدية دبي. ليست منتج HeyLola.",
  },
};
