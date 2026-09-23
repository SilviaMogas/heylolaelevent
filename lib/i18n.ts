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
    "hero.lolaLabel": "Lola · AI concierge for dog parents",
    "hero.suggest.1": "How do I adopt a dog in Dubai?",
    "hero.suggest.2": "What does microchipping and registration involve?",
    "hero.suggest.3": "How do I organise my dog's records in HeyLola?",
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
      "Your voice is sent to ElevenLabs for processing during the conversation. In demo mode no audio is recorded or sent to ElevenLabs.",
    "voice.consent.agree": "I agree to a voice conversation",
    "voice.consent.transcript":
      "Keep a transcript of this conversation (shown here and saved anonymously to help improve Lola)",
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
    "voice.demo.scripts": "Try a scripted demo",
    "voice.status.connecting": "Connecting…",
    "voice.status.live": "Live · ElevenLabs",
    "voice.status.demo": "Demo mode — synthetic answers, no audio",
    "voice.mute": "Mute microphone",
    "voice.unmute": "Unmute microphone",
    "voice.minimisation":
      "We don't ask for names, IDs or documents. We only keep anonymous session stats (language, mode, handover) — and the transcript only if you tick the box above.",
    "voice.human": "Talk to a human / official service",
    "voice.handover.title": "For anything Lola can't verify",
    "voice.handover.heylola":
      "For HeyLola profile questions only: hey@heylola.co",
    "voice.sources": "Sources",
    "voice.you": "You",
    "voice.lola": "Lola",
    "handover.heading": "Talk to a human or an official service",
    "handover.body":
      "Dubai Municipality handles official registration, records and any question Lola can't verify.",
    "privacy.heading": "Privacy & AI note",
    "privacy.body":
      "Lola is an AI assistant. Voice is processed by ElevenLabs when you consent to a live call; demo mode sends no audio. We ask for no names, IDs or documents. We store anonymous session stats (language, mode, whether a handover happened) and the transcript only if you opt in.",
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
    "hero.lolaLabel": "لولا · كونسيرج ذكي لأولياء أمور الكلاب",
    "hero.suggest.1": "كيف أتبنّى كلباً في دبي؟",
    "hero.suggest.2": "ما الذي يتضمنه الترقيم بالشريحة والتسجيل؟",
    "hero.suggest.3": "كيف أنظّم سجلات كلبي في HeyLola؟",
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
      "يُرسَل صوتك إلى ElevenLabs للمعالجة أثناء المحادثة. في الوضع التجريبي لا يُسجَّل أي صوت ولا يُرسَل إلى ElevenLabs.",
    "voice.consent.agree": "أوافق على محادثة صوتية",
    "voice.consent.transcript":
      "احتفظ بنسخة نصية من هذه المحادثة (تُعرض هنا وتُحفَظ بشكل مجهول لتحسين لولا)",
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
    "voice.demo.scripts": "جرّب عرضاً مُعدّاً",
    "voice.status.connecting": "جارٍ الاتصال…",
    "voice.status.live": "مباشر · ElevenLabs",
    "voice.status.demo": "وضع تجريبي — إجابات مُعدّة، بلا صوت",
    "voice.mute": "كتم الميكروفون",
    "voice.unmute": "إلغاء كتم الميكروفون",
    "voice.minimisation":
      "لا نطلب أسماء أو هويات أو مستندات. نحتفظ فقط بإحصاءات مجهولة للجلسة (اللغة، الوضع، التحويل) — وبالنسخة النصية فقط إذا حددت الخيار أعلاه.",
    "voice.human": "تحدّث إلى إنسان / خدمة رسمية",
    "voice.handover.title": "لأي شيء لا تستطيع لولا التحقق منه",
    "voice.handover.heylola":
      "لأسئلة ملف HeyLola فقط: hey@heylola.co",
    "voice.sources": "المصادر",
    "voice.you": "أنت",
    "voice.lola": "لولا",
    "handover.heading": "تحدّث إلى إنسان أو خدمة رسمية",
    "handover.body":
      "بلدية دبي مسؤولة عن التسجيل الرسمي والسجلات وعن أي سؤال لا تستطيع لولا التحقق منه.",
    "privacy.heading": "ملاحظة الخصوصية والذكاء الاصطناعي",
    "privacy.body":
      "لولا مساعدة ذكاء اصطناعي. يُعالَج الصوت عبر ElevenLabs عند موافقتك على مكالمة مباشرة؛ أما الوضع التجريبي فلا يرسل أي صوت. لا نطلب أسماء أو هويات أو مستندات. نخزّن إحصاءات مجهولة للجلسة (اللغة، الوضع، حدوث تحويل) والنسخة النصية فقط إذا وافقت على ذلك.",
    "footer.sources": "المصادر وتواريخ المراجعة",
    "footer.contact": "تواصل",
    "footer.disclaimer":
      "نسخة تحدٍّ تجريبية. لا صلة لها ببلدية دبي. ليست منتج HeyLola.",
  },
};
