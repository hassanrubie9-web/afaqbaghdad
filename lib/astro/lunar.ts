// lib/astro/lunar.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Lunar Phase Engine
// NASA API + local Julian Date calculations
// ============================================================

import { getFromCache, setCache } from '@/lib/cache/memory-cache';
import type { LunarPhaseSnapshot } from '@/types/global';

// Arabic lunar mansion names (Manazil al-Qamar)
const ARABIC_MANSIONS = [
  'الشَّرَطَيْن', 'البُطَيْن', 'الثُّرَيَّا', 'الدَّبَرَان', 'الهَقْعَة',
  'الهَنْعَة', 'الذِّرَاع', 'النَّثْرَة', 'الطَّرْف', 'الجَبْهَة',
  'الزُّبْرَة', 'الصَّرْفَة', 'العَوَّاء', 'السِّمَاك', 'الغَفْر',
  'الزُّبَانَيَيْن', 'الإِكْلِيل', 'القَلْب', 'الشَّوْلَة', 'النَّعَائِم',
  'البَلْدَة', 'سَعْد الذَّابِح', 'سَعْد بُلَع', 'سَعْد السُّعُود', 'سَعْد الأَخْبِيَة',
  'الفَرْغ المُقَدَّم', 'الفَرْغ المُؤَخَّر', 'بَطْن الحُوت',
];

export async function getCurrentLunarPhase(): Promise<LunarPhaseSnapshot> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `lunar:${today}`;
  
  const cached = getFromCache<LunarPhaseSnapshot>(cacheKey);
  if (cached) return cached;

  try {
    // NASA API for lunar data
    const nasaUrl = `https://api.nasa.gov/planetary/moon-phase?api_key=${process.env.NASA_API_KEY}&date=${today}`;
    const res = await fetch(nasaUrl, { next: { revalidate: 14400 } }); // 4-hour revalidation

    if (!res.ok) throw new Error('NASA API unavailable');
    
    const data = await res.json();
    const snapshot = transformNasaLunarData(data, today);

    // Cache for 4 hours
    setCache(cacheKey, snapshot, 4 * 60 * 60 * 1000);
    return snapshot;

  } catch {
    // Fallback: compute lunar phase locally using Julian date
    return computeLunarPhaseFallback();
  }
}

function transformNasaLunarData(data: Record<string, unknown>, date: string): LunarPhaseSnapshot {
  const illumination = Number(data.phase_fraction ?? 0);
  const age = Number(data.moon_age ?? 0);
  const phase = derivePhaseName(illumination, age);
  const mansion = getMansion(age);

  return {
    phase,
    illumination,
    age_days: age,
    next_full_moon: calculateNextFullMoon(age),
    next_new_moon: calculateNextNewMoon(age),
    mansion,
  };
}

function derivePhaseName(illumination: number, age: number): string {
  if (age < 1.5) return 'القمر الجديد';
  if (age < 7) return 'الهلال المتنامي';
  if (age < 8.5) return 'الربع الأول';
  if (age < 14) return 'الأحدب المتنامي';
  if (age < 15.5) return 'البدر الكامل';
  if (age < 21) return 'الأحدب المتناقص';
  if (age < 22.5) return 'الربع الأخير';
  if (age < 28) return 'الهلال المتناقص';
  return 'القمر الجديد';
}

function getMansion(ageDays: number): string {
  // Each mansion spans ~13.18 days / 28 mansions
  const index = Math.floor((ageDays / 29.53) * 28) % 28;
  return ARABIC_MANSIONS[index] ?? ARABIC_MANSIONS[0];
}

function calculateNextFullMoon(ageDays: number): string {
  const daysUntilFull = ageDays < 14.75 ? 14.75 - ageDays : 29.53 - ageDays + 14.75;
  const next = new Date(Date.now() + daysUntilFull * 86_400_000);
  return next.toISOString().split('T')[0];
}

function calculateNextNewMoon(ageDays: number): string {
  const daysUntilNew = 29.53 - ageDays;
  const next = new Date(Date.now() + daysUntilNew * 86_400_000);
  return next.toISOString().split('T')[0];
}

function computeLunarPhaseFallback(): LunarPhaseSnapshot {
  // Known new moon: Jan 1, 2000 Julian date
  const knownNewMoon = new Date('2000-01-06').getTime();
  const synodic = 29.53058867 * 86_400_000;
  const ageDays = ((Date.now() - knownNewMoon) % synodic) / 86_400_000;
  const illumination = (1 - Math.cos((ageDays / 29.53) * 2 * Math.PI)) / 2;

  return {
    phase: derivePhaseName(illumination, ageDays),
    illumination,
    age_days: ageDays,
    next_full_moon: calculateNextFullMoon(ageDays),
    next_new_moon: calculateNextNewMoon(ageDays),
    mansion: getMansion(ageDays),
  };
}
