// types/global.ts
// ============================================================
// Shared types used across server routes and UI components.
// Keep this file lightweight and dependency-free.
// ============================================================

export type EmotionalTone =
  | 'transformative'
  | 'fearful'
  | 'transcendent'
  | 'melancholic'
  | 'joyful'
  | 'prophetic'
  | 'neutral';

export interface DreamInterpretResponse {
  interpretation: string;
  emotional_tone: EmotionalTone;
  symbols_detected: string[];
  lunar_insight: string;
  transit_influence: string;
  entry_id?: string;
}

export interface GeoResolveResponse {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  timezone: string;
  utcOffset: number;
  formatted: string;
}

export type HouseSystem = 'placidus' | 'whole_sign' | 'equal' | 'porphyry' | 'regiomontanus' | 'koch';
export type ZodiacType = 'tropical' | 'sidereal';

// تقاليد/مدارس عرض الأبراج (واجهة عربية)
export type ZodiacTradition = 'western_tropical' | 'sidereal_vedic' | 'babylonian' | 'persian' | 'chinese';


export interface NatalChart {
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
  planets: Array<{
    name: string;
    symbol: string;
    sign: string;
    degree: number;
    minute: number;
    house: number;
    retrograde: boolean;
  }>;
  houses: Array<{ number: number; sign: string; degree: number }>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number; exact_degree: number }>;
  dominant_element: string;
  dominant_modality: string;
  chart_ruler: string;
}

export interface LunarPhaseSnapshot {
  phase: string;
  illumination: number; // 0..1
  ageDays: number;
  timestamp: string;
}

export interface TransitSnapshot {
  significant_aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
  timestamp: string;
}

export interface LearningProfile {
  dominant_themes: string[];
  emotional_tone_history: Array<{ tone: EmotionalTone; timestamp: string; weight: number }>;
  avg_feedback_score: number;
  interpretation_count: number;
  preferred_symbolism: string[];
  last_updated: string;
}
