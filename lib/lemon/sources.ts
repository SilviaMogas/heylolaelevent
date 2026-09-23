/**
 * Lemon — source registry.
 *
 * Every procedural claim the agent or the UI makes about adoption,
 * registration or microchipping in Dubai must point at one of these
 * entries. `kind` tells the reader how much weight the source carries:
 *
 * - `official`  — Dubai Municipality / UAE Government channel.
 * - `secondary` — press or clinic reporting that *describes* an official
 *                 service. Useful for orientation, never authoritative.
 *
 * `reviewedOn` is the date a human last opened the link and confirmed the
 * summary still matched. Anything older than `STALE_AFTER_DAYS` is shown
 * as needing re-verification and the agent must say so.
 */

export type SourceKind = "official" | "secondary";

export interface Source {
  id: string;
  kind: SourceKind;
  publisher: string;
  title: { en: string; ar: string };
  url: string;
  /** ISO date the source was last reviewed by a person. */
  reviewedOn: string;
  /** Publication date when the source states one. */
  publishedOn?: string;
  note?: { en: string; ar: string };
}

export const STALE_AFTER_DAYS = 180;

export const SOURCES: readonly Source[] = [
  {
    id: "dm-portal",
    kind: "official",
    publisher: "Dubai Municipality",
    title: {
      en: "Dubai Municipality — official portal and e-services",
      ar: "بلدية دبي — البوابة الرسمية والخدمات الإلكترونية",
    },
    url: "https://www.dm.gov.ae/",
    reviewedOn: "2026-09-23",
    note: {
      en: "Pet registration, amendment and adoption requests are submitted through the Dubai Municipality e-services (website/app), DubaiNow or the Aleef app, signing in with UAE PASS.",
      ar: "تُقدَّم طلبات تسجيل الحيوانات الأليفة وتعديل بياناتها والتبني عبر الخدمات الإلكترونية لبلدية دبي (الموقع/التطبيق) أو تطبيق دبي الآن أو تطبيق أليف، بتسجيل الدخول عبر الهوية الرقمية.",
    },
  },
  {
    id: "dm-veterinary",
    kind: "official",
    publisher: "Dubai Municipality",
    title: {
      en: "Dubai Municipality Veterinary Application (registration system)",
      ar: "النظام البيطري لبلدية دبي (نظام التسجيل)",
    },
    url: "https://veterinary.dm.gov.ae/",
    reviewedOn: "2026-09-23",
    note: {
      en: "The system where owners, Dubai Municipality staff and accredited private clinics record animal registrations.",
      ar: "النظام الذي يسجّل فيه الملاك وموظفو بلدية دبي والعيادات الخاصة المعتمدة بيانات الحيوانات.",
    },
  },
  {
    id: "dm-contact",
    kind: "official",
    publisher: "Dubai Municipality",
    title: {
      en: "Dubai Municipality — Help and Support / FAQ",
      ar: "بلدية دبي — المساعدة والدعم / الأسئلة الشائعة",
    },
    url: "https://www.dm.gov.ae/contact/",
    reviewedOn: "2026-09-23",
    note: {
      en: "Call centre 800 900 (toll-free, 24/7), +971 4 2215555, info@dm.gov.ae. Only companion animals may be kept at home; dangerous breeds under Federal Law No. 22 of 2016 are excluded.",
      ar: "مركز الاتصال 800 900 (مجاني، على مدار الساعة)، ‎+971 4 2215555، info@dm.gov.ae. يُسمح فقط بتربية الحيوانات المنزلية، وتُستثنى السلالات الخطرة وفق القانون الاتحادي رقم 22 لسنة 2016.",
    },
  },
  {
    id: "dm-app",
    kind: "official",
    publisher: "Dubai Municipality",
    title: {
      en: "Dubai Municipality mobile app (includes the pet adoption platform)",
      ar: "تطبيق بلدية دبي (يتضمن منصة تبني الحيوانات الأليفة)",
    },
    url: "https://www.dm.gov.ae/dubai-municipality-app/",
    reviewedOn: "2026-09-23",
    note: {
      en: "Describes the unified app: e-service applications, application status and a unified pet adoption platform.",
      ar: "يصف التطبيق الموحّد: تقديم طلبات الخدمات ومتابعة حالتها ومنصة موحّدة لتبني الحيوانات الأليفة.",
    },
  },
  {
    id: "e247-dm-vet-guide",
    kind: "secondary",
    publisher: "Emirates 24|7",
    title: {
      en: "Dubai Municipality guide: everything pet owners need to know about veterinary services",
      ar: "دليل بلدية دبي: كل ما يحتاج ملاك الحيوانات الأليفة معرفته عن الخدمات البيطرية",
    },
    url: "https://www.emirates247.com/uae/dubai-municipality-guide-everything-pet-owners-need-to-know-about-veterinary-services/1514",
    reviewedOn: "2026-09-23",
    publishedOn: "2026-05-12",
    note: {
      en: "Press summary of the Dubai Municipality 'Adopt pets' and 'Pet registration' services, including reported fees, documents and the Al Khawaneej Veterinary Clinic steps.",
      ar: "ملخص صحفي لخدمتَي «تبني الحيوانات الأليفة» و«تسجيل الحيوانات الأليفة» لدى بلدية دبي، يشمل الرسوم والمستندات المذكورة وخطوات عيادة الخوانيج البيطرية.",
    },
  },
  {
    id: "wam-dm-h1-2026",
    kind: "secondary",
    publisher: "Emirates News Agency (WAM)",
    title: {
      en: "Dubai Municipality delivers nearly 183,700 veterinary services in H1 2026",
      ar: "بلدية دبي تقدّم نحو 183,700 خدمة بيطرية في النصف الأول من 2026",
    },
    url: "https://www.wam.ae/en/article/c1atedv-dubai-municipality-delivers-nearly-183700",
    reviewedOn: "2026-09-23",
    publishedOn: "2026-07-19",
    note: {
      en: "State news agency: registration services let owners register, microchip and update records of cats and dogs; Dubai Municipality regulates pet entry and adoption.",
      ar: "وكالة الأنباء الرسمية: خدمات التسجيل تتيح للملاك تسجيل القطط والكلاب وترقيمها بالشريحة وتحديث بياناتها؛ وتنظّم بلدية دبي دخول الحيوانات الأليفة والتبني.",
    },
  },
  {
    id: "gulfnews-amend-2024",
    kind: "secondary",
    publisher: "Gulf News",
    title: {
      en: "How to update pet microchip details online with Dubai Municipality",
      ar: "كيفية تحديث بيانات شريحة الحيوان الأليف إلكترونياً لدى بلدية دبي",
    },
    url: "https://gulfnews.com/living-in-uae/ask-us/dubai-pet-owners-keep-your-furry-friend-safe--how-to-update-pet-microchip-details-online-1.1726579690939",
    reviewedOn: "2026-09-23",
    publishedOn: "2024-09-17",
    note: {
      en: "Walk-through of the 'Register pets and farm animals' e-service: UAE PASS sign-in, request type 'Amend', Makani number, microchip validation, reported Dh10 amendment fee.",
      ar: "شرح لخدمة «تسجيل الحيوانات الأليفة وحيوانات المزارع»: الدخول بالهوية الرقمية، نوع الطلب «تعديل»، رقم مكاني، التحقق من رقم الشريحة، ورسم تعديل مذكور بقيمة 10 دراهم.",
    },
  },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];

export function getSource(id: SourceId): Source {
  const source = SOURCES.find((s) => s.id === id);
  if (!source) throw new Error(`Unknown Lemon source: ${id}`);
  return source;
}

export function isStale(source: Source, today: Date = new Date()): boolean {
  const reviewed = new Date(`${source.reviewedOn}T00:00:00Z`).getTime();
  const ageDays = (today.getTime() - reviewed) / 86_400_000;
  return ageDays > STALE_AFTER_DAYS;
}
