// lib/i18n/dict.ts
// Minimal lightweight i18n dictionary — no external dependency.

export type Lang = "ar" | "en";

export const DICT = {
  nav: {
    home:          { ar: "الرئيسية",       en: "Home" },
    chart:         { ar: "خريطة الميلاد", en: "Birth Chart" },
    forecast:      { ar: "التوقعات",       en: "Forecast" },
    dashboard:     { ar: "لوحة التحكم",    en: "Dashboard" },
    compatibility: { ar: "التوافق",        en: "Compatibility" },
    solarReturn:   { ar: "عودة الشمس",     en: "Solar Return" },
    lifeCycles:    { ar: "دورات الحياة",   en: "Life Cycles" },
    journal:       { ar: "يومياتي",        en: "Journal" },
    electional:    { ar: "اختيار الوقت",   en: "Electional" },
    login:         { ar: "تسجيل الدخول",   en: "Login" },
    replayIntro:   { ar: "إعادة الانترو",  en: "Replay Intro" },
  },
  footer: {
    tagline: {
      ar: "منصة فلك عربية أولاً — تصفح التيارات السماوية.",
      en: "Arabic-first astrology platform — navigate the celestial currents.",
    },
    privacy: { ar: "الخصوصية", en: "Privacy" },
    terms:   { ar: "الشروط",   en: "Terms" },
    contact: { ar: "تواصل",    en: "Contact" },
    copy:    {
      ar: "© جميع الحقوق محفوظة لحسن محمد",
      en: "© All rights reserved to Hassan Mohammed",
    },
  },
  chart: {
    title:       { ar: "نتيجة خريطة الميلاد", en: "Birth Chart Result" },
    tradition:   { ar: "التقليد",             en: "Tradition" },
    houseSystem: { ar: "نظام البيوت",         en: "House System" },
    print:       { ar: "طباعة",               en: "Print" },
    newChart:    { ar: "إنشاء خريطة جديدة",   en: "New Chart" },
    ascendant:   { ar: "الطالع",              en: "Ascendant" },
    mc:          { ar: "وسط السماء",           en: "Midheaven" },
    planets:     { ar: "الكواكب",             en: "Planets" },
    aspects:     { ar: "الجوانب",             en: "Aspects" },
    house:       { ar: "البيت",               en: "House" },
    orb:         { ar: "هامش",                en: "Orb" },
    disclaimer:  {
      ar: "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      en: "For guidance and reflection purposes only — not absolute prediction.",
    },
  },
  compatibility: {
    title:       { ar: "التوافق الفلكي",          en: "Astrological Compatibility" },
    person1:     { ar: "الشخص الأول",              en: "Person 1" },
    person2:     { ar: "الشخص الثاني",             en: "Person 2" },
    calculate:   { ar: "احسب التوافق",             en: "Calculate Compatibility" },
    disclaimer:  {
      ar: "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      en: "For guidance and reflection only — not absolute prediction.",
    },
  },
  solarReturn: {
    title:     { ar: "عودة الشمس",           en: "Solar Return" },
    year:      { ar: "السنة",                en: "Year" },
    calculate: { ar: "احسب عودة الشمس",      en: "Calculate Solar Return" },
  },
  lifeCycles: {
    title:         { ar: "دورات الحياة",      en: "Life Cycles" },
    saturnReturn:  { ar: "عودة زحل",          en: "Saturn Return" },
    jupiterReturn: { ar: "عودة المشتري",      en: "Jupiter Return" },
    nodalReturn:   { ar: "عودة العقدة",       en: "Nodal Return" },
  },
  journal: {
    title:     { ar: "يوميات الفلك",    en: "Astro Journal" },
    newEntry:  { ar: "إضافة يومية",     en: "New Entry" },
    mood:      { ar: "المزاج",          en: "Mood" },
    notes:     { ar: "ملاحظات",         en: "Notes" },
    save:      { ar: "حفظ",             en: "Save" },
    analytics: { ar: "التحليلات",       en: "Analytics" },
  },
  electional: {
    title:    { ar: "اختيار الوقت المناسب",  en: "Electional Astrology" },
    goal:     { ar: "الهدف",                 en: "Goal" },
    suggest:  { ar: "اقترح أوقاتاً",        en: "Suggest Times" },
    goals: {
      travel:  { ar: "سفر",           en: "Travel" },
      signing: { ar: "توقيع عقد",     en: "Contract Signing" },
      exam:    { ar: "امتحان / مقابلة", en: "Exam / Interview" },
      wedding: { ar: "زواج",          en: "Wedding" },
      business:{ ar: "عمل / استثمار", en: "Business / Investment" },
    },
  },
  common: {
    loading:    { ar: "جارٍ التحميل…",  en: "Loading…" },
    error:      { ar: "حدث خطأ",        en: "An error occurred" },
    birthDate:  { ar: "تاريخ الميلاد",  en: "Birth Date" },
    birthTime:  { ar: "وقت الميلاد",    en: "Birth Time" },
    city:       { ar: "المدينة",         en: "City" },
    country:    { ar: "الدولة",          en: "Country" },
    lat:        { ar: "خط العرض",       en: "Latitude" },
    lng:        { ar: "خط الطول",       en: "Longitude" },
    timezone:   { ar: "المنطقة الزمنية", en: "Timezone" },
  },
} as const;

export function t(
  path: string,
  lang: Lang
): string {
  const parts = path.split(".");
  let cur: any = DICT;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return path; // fallback to key
  }
  if (cur && typeof cur === "object" && lang in cur) return cur[lang];
  return path;
}
