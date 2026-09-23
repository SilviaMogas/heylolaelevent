/**
 * Lemon — journey guidance.
 *
 * Three journeys, each a list of steps. Every step carries:
 *  - `sourceIds`: which registry entries back it (may be empty only when
 *    `verification === "unverified"`).
 *  - `verification`:
 *      "official"  — stated on a Dubai Municipality / UAE Government channel.
 *      "reported"  — reported by press/clinics describing the official
 *                    service. Presented as "reported; confirm with Dubai
 *                    Municipality".
 *      "unverified"— we could not confirm this. The UI and the agent must
 *                    say so and hand over to the authority.
 *  - `authority`: who actually performs/decides the step. HeyLola is never
 *    the authority for registration or identification.
 */
import type { SourceId } from "./sources";

export type Lang = "en" | "ar";
export type JourneyId = "adopt" | "register" | "profile";
export type Verification = "official" | "reported" | "unverified";
export type Authority = "dubai_municipality" | "vet_clinic" | "shelter" | "heylola" | "you";

export interface Step {
  id: string;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  sourceIds: SourceId[];
  verification: Verification;
  authority: Authority;
}

export interface Journey {
  id: JourneyId;
  title: Record<Lang, string>;
  summary: Record<Lang, string>;
  steps: Step[];
}

export const JOURNEYS: readonly Journey[] = [
  {
    id: "adopt",
    title: { en: "How to adopt a dog in Dubai", ar: "كيف تتبنّى كلباً في دبي" },
    summary: {
      en: "Two legitimate routes: Dubai Municipality's own adoption service, or a licensed shelter / rescue group. HeyLola is neither — it only helps you organise the paperwork afterwards.",
      ar: "هناك طريقان مشروعان: خدمة التبني التابعة لبلدية دبي، أو ملجأ/جمعية إنقاذ مرخّصة. HeyLola ليست أيّاً منهما — بل تساعدك فقط على تنظيم الأوراق لاحقاً.",
    },
    steps: [
      {
        id: "adopt-eligibility",
        title: { en: "Check you can keep a dog", ar: "تأكّد أن بإمكانك تربية كلب" },
        body: {
          en: "Dubai Municipality allows companion animals at home but excludes breeds listed as dangerous under Federal Law No. 22 of 2016. Check your tenancy or community rules as well.",
          ar: "تسمح بلدية دبي بتربية الحيوانات المنزلية لكنها تستثني السلالات المصنّفة خطرة وفق القانون الاتحادي رقم 22 لسنة 2016. راجع أيضاً عقد الإيجار وقواعد المجمّع السكني.",
        },
        sourceIds: ["dm-contact"],
        verification: "official",
        authority: "dubai_municipality",
      },
      {
        id: "adopt-dm-route",
        title: { en: "Route A — Dubai Municipality adoption service", ar: "المسار أ — خدمة التبني لدى بلدية دبي" },
        body: {
          en: "Apply through Dubai Municipality e-services, DubaiNow or the Aleef app with UAE PASS. If eligible you are contacted, visit Al Khawaneej Veterinary Clinic to meet the dog, pay the vaccination, microchip and registration fees, and leave with the dog and its records. Press reports list roughly Dh150 vaccination, Dh50 microchip, Dh10 registration plus a Dh20 knowledge fee, and a minimum age of 21 — confirm the current figures with Dubai Municipality.",
          ar: "قدّم الطلب عبر الخدمات الإلكترونية لبلدية دبي أو دبي الآن أو تطبيق أليف بالهوية الرقمية. إن كنت مؤهلاً يتم التواصل معك، ثم تزور عيادة الخوانيج البيطرية للقاء الكلب، وتدفع رسوم التطعيم والشريحة والتسجيل، وتستلم الكلب مع سجلاته. تذكر التقارير الصحفية نحو 150 درهماً للتطعيم و50 للشريحة و10 للتسجيل و20 رسوم معرفة، وحداً أدنى للعمر 21 سنة — تأكّد من الأرقام الحالية لدى بلدية دبي.",
        },
        sourceIds: ["dm-app", "e247-dm-vet-guide"],
        verification: "reported",
        authority: "dubai_municipality",
      },
      {
        id: "adopt-shelter-route",
        title: { en: "Route B — licensed shelter or rescue group", ar: "المسار ب — ملجأ أو جمعية إنقاذ مرخّصة" },
        body: {
          en: "Shelters run their own screening, home checks and adoption fees, and usually hand over a vaccinated, microchipped dog. Their process is theirs, not HeyLola's, and HeyLola has no partnership with any shelter. Ask the shelter for the microchip number and vaccination record on the day.",
          ar: "تُجري الملاجئ فحصها الخاص وزيارات منزلية ورسوم تبني، وعادة تسلّمك كلباً مطعّماً ومزوّداً بشريحة. إجراءاتها خاصة بها ولا تخصّ HeyLola، ولا تربط HeyLola أي شراكة بأي ملجأ. اطلب من الملجأ رقم الشريحة وسجل التطعيم يوم الاستلام.",
        },
        sourceIds: [],
        verification: "unverified",
        authority: "shelter",
      },
      {
        id: "adopt-then-register",
        title: { en: "Register the dog in your name", ar: "سجّل الكلب باسمك" },
        body: {
          en: "Whichever route you take, the dog must end up registered with Dubai Municipality under your name. If it was already registered to the shelter or a previous owner, the ownership has to be transferred (an NOC from the previous owner is listed among the required documents).",
          ar: "أياً كان المسار، يجب أن يُسجَّل الكلب لدى بلدية دبي باسمك. إذا كان مسجلاً باسم الملجأ أو مالك سابق فيجب نقل الملكية (وتُذكر شهادة عدم ممانعة من المالك السابق ضمن المستندات المطلوبة).",
        },
        sourceIds: ["dm-portal", "e247-dm-vet-guide"],
        verification: "reported",
        authority: "dubai_municipality",
      },
    ],
  },
  {
    id: "register",
    title: { en: "Registration and microchipping", ar: "التسجيل والترقيم بالشريحة" },
    summary: {
      en: "Dubai Municipality is the only body that registers dogs in Dubai and issues the official registration and tag. The microchip is implanted by a vet and its number is validated in the Municipality's system.",
      ar: "بلدية دبي هي الجهة الوحيدة التي تسجّل الكلاب في دبي وتصدر التسجيل الرسمي والبطاقة المعدنية. يزرع الطبيب البيطري الشريحة ويُتحقَّق من رقمها في نظام البلدية.",
    },
    steps: [
      {
        id: "reg-microchip",
        title: { en: "Microchip at a vet", ar: "زرع الشريحة عند الطبيب البيطري" },
        body: {
          en: "A veterinary clinic (Dubai Municipality's Al Khawaneej clinic or an accredited private clinic) checks the dog and implants an ISO microchip. Dubai Municipality lists 'animal numbering' at a reported Dh50 per microchip. Keep the microchip certificate — you will need the number for every later step.",
          ar: "تفحص العيادة البيطرية (عيادة الخوانيج التابعة للبلدية أو عيادة خاصة معتمدة) الكلب وتزرع شريحة بمعيار ISO. تُدرج بلدية دبي «ترقيم الحيوان» برسم مذكور قدره 50 درهماً للشريحة. احتفظ بشهادة الشريحة — ستحتاج رقمها في كل خطوة لاحقة.",
        },
        sourceIds: ["dm-veterinary", "e247-dm-vet-guide"],
        verification: "reported",
        authority: "vet_clinic",
      },
      {
        id: "reg-vaccination",
        title: { en: "Vaccination up to date", ar: "التطعيمات محدّثة" },
        body: {
          en: "Vaccination is mandatory for dogs in Dubai and registration is tied to a current rabies vaccination. The vaccination record or pet passport is one of the documents requested when registering.",
          ar: "التطعيم إلزامي للكلاب في دبي ويرتبط التسجيل بتطعيم ساري ضد داء الكلب. سجل التطعيم أو جواز الحيوان من المستندات المطلوبة عند التسجيل.",
        },
        sourceIds: ["e247-dm-vet-guide", "wam-dm-h1-2026"],
        verification: "reported",
        authority: "vet_clinic",
      },
      {
        id: "reg-apply",
        title: { en: "Apply for registration with Dubai Municipality", ar: "قدّم طلب التسجيل لدى بلدية دبي" },
        body: {
          en: "Use the 'Register pets and farm animals' e-service on dm.gov.ae, the Dubai Municipality app, DubaiNow or Aleef, signing in with UAE PASS, or call 800 900. You provide your Emirates ID details, Makani number, the dog's details and its microchip number; the dog must be physically present at the visit. Reported fee: Dh10 registration (+ VAT). Completion is listed as one working day from the appointment.",
          ar: "استخدم خدمة «تسجيل الحيوانات الأليفة وحيوانات المزارع» على dm.gov.ae أو تطبيق البلدية أو دبي الآن أو أليف بالهوية الرقمية، أو اتصل بـ 800 900. تقدّم بيانات هويتك الإماراتية ورقم مكاني وبيانات الكلب ورقم شريحته؛ ويجب حضور الكلب شخصياً عند الزيارة. الرسم المذكور: 10 دراهم للتسجيل (+ ضريبة القيمة المضافة). الإنجاز مُدرج خلال يوم عمل من موعد الزيارة.",
        },
        sourceIds: ["dm-portal", "e247-dm-vet-guide", "gulfnews-amend-2024"],
        verification: "reported",
        authority: "dubai_municipality",
      },
      {
        id: "reg-tag",
        title: { en: "Receive the official registration and tag", ar: "استلام التسجيل الرسمي والبطاقة" },
        body: {
          en: "Dubai Municipality issues the registration (confirmed by SMS/email) and a Municipality tag linked to the microchip. This registration number is the dog's only official ID in Dubai — HeyLola does not issue, replace or verify it.",
          ar: "تصدر بلدية دبي التسجيل (ويُؤكَّد برسالة نصية/بريد إلكتروني) وبطاقة معدنية مرتبطة بالشريحة. رقم التسجيل هذا هو الهوية الرسمية الوحيدة للكلب في دبي — و HeyLola لا تُصدره ولا تستبدله ولا تتحقق منه.",
        },
        sourceIds: ["dm-veterinary", "wam-dm-h1-2026"],
        verification: "reported",
        authority: "dubai_municipality",
      },
      {
        id: "reg-amend",
        title: { en: "Keep the record current", ar: "حافظ على تحديث السجل" },
        body: {
          en: "If you move, change phone number or the dog changes owner, submit an 'Amend' request through the same e-service (reported Dh10 fee). Annual vaccination renewals are also recorded with the Municipality.",
          ar: "إذا انتقلت أو غيّرت رقم هاتفك أو تغيّر مالك الكلب، قدّم طلب «تعديل» عبر الخدمة نفسها (رسم مذكور 10 دراهم). كما تُسجَّل تجديدات التطعيم السنوية لدى البلدية.",
        },
        sourceIds: ["gulfnews-amend-2024", "dm-portal"],
        verification: "reported",
        authority: "dubai_municipality",
      },
      {
        id: "reg-penalties",
        title: { en: "Penalties for not registering", ar: "عقوبات عدم التسجيل" },
        body: {
          en: "Fines and confiscation rules for unregistered or untagged dogs are described by private clinics, but we could not confirm the current amounts on an official Dubai Municipality page. Ask Dubai Municipality (800 900) for the applicable penalties.",
          ar: "تصف عيادات خاصة الغرامات وقواعد المصادرة للكلاب غير المسجّلة أو بدون بطاقة، لكننا لم نستطع تأكيد المبالغ الحالية على صفحة رسمية لبلدية دبي. اسأل بلدية دبي (800 900) عن العقوبات المعمول بها.",
        },
        sourceIds: ["dm-contact"],
        verification: "unverified",
        authority: "dubai_municipality",
      },
    ],
  },
  {
    id: "profile",
    title: { en: "Organise the records in a HeyLola profile", ar: "نظّم السجلات في ملف HeyLola" },
    summary: {
      en: "After the official process, HeyLola lets you keep the documents in one place so you can find them for vets, travel, boarding or a lost-dog situation. It is a private organiser, not a registry.",
      ar: "بعد الإجراء الرسمي، تتيح لك HeyLola حفظ المستندات في مكان واحد لتجدها عند الطبيب البيطري أو السفر أو الإيواء أو في حال فقدان الكلب. إنها منظّم خاص وليست سجلاً رسمياً.",
    },
    steps: [
      {
        id: "profile-create",
        title: { en: "Create the dog's profile", ar: "أنشئ ملف الكلب" },
        body: {
          en: "Add the dog's name, breed, date of birth and a photo. Only add what you need — the profile works without any of your personal identifiers.",
          ar: "أضف اسم الكلب وسلالته وتاريخ ولادته وصورة. أضف ما تحتاجه فقط — يعمل الملف دون أي من معرّفاتك الشخصية.",
        },
        sourceIds: [],
        verification: "official",
        authority: "heylola",
      },
      {
        id: "profile-official",
        title: { en: "Record the official identifiers as references", ar: "سجّل المعرّفات الرسمية كمراجع" },
        body: {
          en: "Enter the microchip number and the Dubai Municipality registration number, and attach a photo of the certificate and tag. HeyLola stores these as your own notes and copies; the official record lives with Dubai Municipality, and only they can confirm or change it.",
          ar: "أدخل رقم الشريحة ورقم تسجيل بلدية دبي، وأرفق صورة للشهادة والبطاقة. تحفظ HeyLola هذه البيانات كملاحظاتك ونسخك؛ أما السجل الرسمي فيبقى لدى بلدية دبي وهي وحدها من يمكنها تأكيده أو تعديله.",
        },
        sourceIds: ["dm-veterinary"],
        verification: "official",
        authority: "heylola",
      },
      {
        id: "profile-care",
        title: { en: "Add care and access details", ar: "أضف بيانات الرعاية والوصول" },
        body: {
          en: "Vaccination dates, vet, insurance, medications and emergency contacts, plus reminders for the annual vaccination and registration renewal.",
          ar: "مواعيد التطعيم والطبيب البيطري والتأمين والأدوية وجهات اتصال الطوارئ، مع تذكيرات للتطعيم السنوي وتجديد التسجيل.",
        },
        sourceIds: [],
        verification: "official",
        authority: "heylola",
      },
      {
        id: "profile-update",
        title: { en: "Update HeyLola after you update Dubai Municipality", ar: "حدّث HeyLola بعد تحديث بلدية دبي" },
        body: {
          en: "Change of address, phone or ownership must be amended with Dubai Municipality first; then mirror the change in the HeyLola profile so your copies stay consistent.",
          ar: "يجب تعديل تغيير العنوان أو الهاتف أو الملكية لدى بلدية دبي أولاً؛ ثم انسخ التغيير في ملف HeyLola لتبقى نسخك متطابقة.",
        },
        sourceIds: ["gulfnews-amend-2024"],
        verification: "reported",
        authority: "you",
      },
    ],
  },
] as const;

export function getJourney(id: JourneyId): Journey {
  const journey = JOURNEYS.find((j) => j.id === id);
  if (!journey) throw new Error(`Unknown Lemon journey: ${id}`);
  return journey;
}
