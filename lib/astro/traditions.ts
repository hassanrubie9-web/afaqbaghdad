import type { ZodiacTradition } from '@/types/global';

/**
 * طبقة العرض: لا تغيّر الحسابات الفلكية في Phase 1
 * بل تغيّر التسميات/الشرح/الرموز حسب التقليد المختار.
 */

export const TRADITIONS: { key: ZodiacTradition; name_ar: string; description_ar: string }[] = [
  { key: 'western_tropical', name_ar: 'الغربي (مداري)', description_ar: 'الأكثر شيوعاً في الغرب، يعتمد على الاعتدال الربيعي.' },
  { key: 'sidereal_vedic', name_ar: 'السيديري (فيدي)', description_ar: 'يعتمد على النجوم الثابتة تقريباً مع إزاحة آيانامسا.' },
  { key: 'babylonian', name_ar: 'البابلي/الرافدي', description_ar: 'عرض تاريخي مستلهم من تقاليد بلاد الرافدين.' },
  { key: 'persian', name_ar: 'الفارسي', description_ar: 'تسميات/قراءات بلمسة فارسية مع عناصر رمزية.' },
  { key: 'chinese', name_ar: 'الصيني (قمري/عناصر)', description_ar: 'نظام مختلف: حيوان السنة + عنصرها. Phase 1: عرض معلومات إضافية.' },
];

export const WESTERN_SIGNS_AR: Record<string, string> = {
  Aries: 'الحمل',
  Taurus: 'الثور',
  Gemini: 'الجوزاء',
  Cancer: 'السرطان',
  Leo: 'الأسد',
  Virgo: 'العذراء',
  Libra: 'الميزان',
  Scorpio: 'العقرب',
  Sagittarius: 'القوس',
  Capricorn: 'الجدي',
  Aquarius: 'الدلو',
  Pisces: 'الحوت',
};

export const WESTERN_SIGNS_GLYPH: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

// تسميات “تقريبية” للمدارس التاريخية: نستخدم نفس تقسيم 12 برج في Phase 1
export const BABYLONIAN_SIGNS_AR: Record<string, string> = {
  Aries: 'الراعي (تقريباً الحمل)',
  Taurus: 'الثور السماوي',
  Gemini: 'التوأمان',
  Cancer: 'السرطان',
  Leo: 'الأسد',
  Virgo: 'السنبل',
  Libra: 'الميزان',
  Scorpio: 'العقرب',
  Sagittarius: 'القوس',
  Capricorn: 'الماعز-السمك',
  Aquarius: 'الساقي',
  Pisces: 'السمكتان',
};

export const PERSIAN_SIGNS_AR: Record<string, string> = {
  Aries: 'حمل',
  Taurus: 'ثور',
  Gemini: 'جوزا',
  Cancer: 'سرطان',
  Leo: 'اسد',
  Virgo: 'سنبله',
  Libra: 'ميزان',
  Scorpio: 'عقرب',
  Sagittarius: 'قوس',
  Capricorn: 'جدی',
  Aquarius: 'دلو',
  Pisces: 'حوت',
};

export function signLabelArabic(signEn: string, tradition: ZodiacTradition): { name: string; glyph: string } {
  const glyph = WESTERN_SIGNS_GLYPH[signEn] ?? '✦';
  switch (tradition) {
    case 'babylonian':
      return { name: BABYLONIAN_SIGNS_AR[signEn] ?? WESTERN_SIGNS_AR[signEn] ?? signEn, glyph };
    case 'persian':
      return { name: PERSIAN_SIGNS_AR[signEn] ?? WESTERN_SIGNS_AR[signEn] ?? signEn, glyph };
    default:
      return { name: WESTERN_SIGNS_AR[signEn] ?? signEn, glyph };
  }
}

export function planetLabelArabic(nameEn: string): { name: string; glyph: string } {
  const map: Record<string, { name: string; glyph: string }> = {
    Sun: { name: 'الشمس', glyph: '☉' },
    Moon: { name: 'القمر', glyph: '☽' },
    Mercury: { name: 'عطارد', glyph: '☿' },
    Venus: { name: 'الزهرة', glyph: '♀' },
    Mars: { name: 'المريخ', glyph: '♂' },
    Jupiter: { name: 'المشتري', glyph: '♃' },
    Saturn: { name: 'زحل', glyph: '♄' },
    Uranus: { name: 'أورانوس', glyph: '♅' },
    Neptune: { name: 'نبتون', glyph: '♆' },
    Pluto: { name: 'بلوتو', glyph: '♇' },
    Chiron: { name: 'كيرون', glyph: '⚷' },
    'North Node': { name: 'العقدة الشمالية', glyph: '☊' },
    'South Node': { name: 'العقدة الجنوبية', glyph: '☋' },
  };
  return map[nameEn] ?? { name: nameEn, glyph: '✦' };
}

export function chineseZodiacForYear(year: number): { animal_ar: string; element_ar: string } {
  // 12 animals cycle
  const animals = [
    'الفأر', 'الثور', 'النمر', 'الأرنب', 'التنين', 'الثعبان',
    'الحصان', 'العنزة', 'القرد', 'الديك', 'الكلب', 'الخنزير',
  ];
  // 10 heavenly stems -> elements (wood fire earth metal water) with yin/yang; Phase 1 simplified
  const elements = ['الخشب', 'النار', 'الأرض', 'المعدن', 'الماء'];

  const animal = animals[(year - 1900) % 12] ?? '—';
  const stemIndex = (year - 1900) % 10;
  const element = elements[Math.floor(stemIndex / 2)] ?? '—';

  return { animal_ar: animal, element_ar: element };
}
