// lib/ai/learning-engine.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Self-Improving AI Learning System
// Adaptive interpretation engine using feedback loops
// ============================================================

import { createServerClient } from '@/lib/db/supabase-server';
import { logger } from '@/lib/security/logger';
import type { LearningProfile, EmotionalTone } from '@/types/global';

// ── Learning Engine Architecture ─────────────────────────────
//
//  User submits dream
//       ↓
//  Fetch learning profile (dominant themes, avg tone, feedback history)
//       ↓
//  Build adaptive prompt (inject profile context)
//       ↓
//  AI generates interpretation
//       ↓
//  User rates the interpretation (1-5)
//       ↓
//  Update profile: themes, tone weights, avg score
//       ↓
//  Next interpretation is better calibrated
//
// Over time, the system learns:
//  - Which symbols resonate with this user
//  - What emotional depth they prefer
//  - Preferred symbolic frameworks (Islamic, Mesopotamian, Jungian)
//  - When they need grounding vs. elevation
// ─────────────────────────────────────────────────────────────

export interface AdaptivePromptContext {
  dominant_themes: string[];
  preferred_tone_depth: 'surface' | 'intermediate' | 'deep';
  avg_score: number;
  interpretation_count: number;
  recent_emotional_trajectory: EmotionalTone[];
  recommended_framework: SymbolicFramework;
}

export type SymbolicFramework = 'mesopotamian' | 'islamic' | 'jungian' | 'universal';

/**
 * Fetches user learning profile and transforms it into adaptive context
 * for the AI prompt builder.
 */
export async function getUserLearningProfile(userId: string): Promise<AdaptivePromptContext | null> {
  try {
    const supabase = await createServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('learning_profile')
      .eq('uuid', userId)
      .single();

    if (error || !user) return null;

    const profile: LearningProfile = user.learning_profile;

    // Determine preferred tone depth based on avg feedback score
    let preferred_tone_depth: 'surface' | 'intermediate' | 'deep' = 'intermediate';
    if (profile.avg_feedback_score >= 4.0) {
      preferred_tone_depth = 'deep';
    } else if (profile.avg_feedback_score < 2.5) {
      preferred_tone_depth = 'surface';
    }

    // Extract recent emotional trajectory (last 5 sessions)
    const recent_emotional_trajectory = profile.emotional_tone_history
      .slice(-5)
      .map(h => h.tone);

    // Recommend symbolic framework based on dominant themes
    const recommended_framework = deriveSymbolicFramework(profile.dominant_themes);

    return {
      dominant_themes: profile.dominant_themes.slice(0, 10),
      preferred_tone_depth,
      avg_score: profile.avg_feedback_score,
      interpretation_count: profile.interpretation_count,
      recent_emotional_trajectory,
      recommended_framework,
    };
  } catch (err) {
    logger.warn('Failed to fetch learning profile', { userId, error: String(err) });
    return null;
  }
}

/**
 * After a new dream interpretation, update user's learning profile
 * with newly detected symbols and emotional tone.
 */
export async function updateLearningProfile(
  userId: string,
  newSymbols: string[],
  newTone: EmotionalTone,
  feedbackScore?: number
): Promise<void> {
  try {
    const supabase = await createServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('learning_profile')
      .eq('uuid', userId)
      .single();

    if (!user) return;

    const profile: LearningProfile = user.learning_profile;

    // Merge new symbols into dominant themes (frequency-weighted)
    const updatedThemes = mergeThemes(profile.dominant_themes, newSymbols);

    // Append emotional tone to history (keep last 20)
    const updatedHistory = [
      ...profile.emotional_tone_history.slice(-19),
      { tone: newTone, timestamp: new Date().toISOString(), weight: 1.0 },
    ];

    // Recalculate avg feedback score if score provided
    let newAvg = profile.avg_feedback_score;
    let newCount = profile.interpretation_count + 1;
    if (feedbackScore !== undefined) {
      newAvg = ((profile.avg_feedback_score * profile.interpretation_count) + feedbackScore) / newCount;
    }

    await supabase
      .from('users')
      .update({
        learning_profile: {
          dominant_themes: updatedThemes,
          emotional_tone_history: updatedHistory,
          avg_feedback_score: Math.round(newAvg * 100) / 100,
          interpretation_count: newCount,
          preferred_symbolism: profile.preferred_symbolism,
          last_updated: new Date().toISOString(),
        },
      })
      .eq('uuid', userId);

  } catch (err) {
    logger.error('Failed to update learning profile', { userId, error: String(err) });
  }
}

/**
 * Semantic similarity search — find previous dreams with similar energy
 * for context injection into new interpretations.
 */
export async function findSimilarDreams(
  userId: string,
  embeddingVector: number[],
  limit = 3
): Promise<Array<{ dream_text: string; emotional_tone: string; feedback_score: number | null }>> {
  try {
    const supabase = await createServerClient();

    // pgvector cosine similarity search
    const { data } = await supabase.rpc('match_dreams', {
      query_embedding: embeddingVector,
      match_user_id: userId,
      match_threshold: 0.75,
      match_count: limit,
    });

    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Generate a personalized recommendation based on astrological transits
 * and user learning history. Called from the dashboard.
 */
export async function generatePersonalizedInsight(
  userId: string,
  currentTransits: Record<string, unknown>
): Promise<string> {
  const profile = await getUserLearningProfile(userId);
  if (!profile) return '';

  // Build recommendation: if user has had fearful dreams under Mars transits,
  // and Mars is currently active → provide grounding insight
  const insight = buildTransitRecommendation(currentTransits, profile);
  return insight;
}

// ── Private helpers ───────────────────────────────────────────

function mergeThemes(existing: string[], newSymbols: string[]): string[] {
  const counts: Record<string, number> = {};
  
  // Count existing with decay
  existing.forEach((theme, i) => {
    counts[theme] = (counts[theme] || 0) + (existing.length - i);
  });

  // Add new symbols
  newSymbols.forEach(symbol => {
    counts[symbol] = (counts[symbol] || 0) + 3; // New weight boost
  });

  // Sort by frequency and return top 15
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([theme]) => theme);
}

function deriveSymbolicFramework(themes: string[]): SymbolicFramework {
  const mesopotamianKeywords = ['enlil', 'ishtar', 'tigris', 'euphrates', 'ziggurat', 'lion', 'bull'];
  const islamicKeywords = ['kaaba', 'light', 'prophet', 'angel', 'garden', 'paradise', 'qibla'];
  const jungianKeywords = ['shadow', 'anima', 'animus', 'self', 'archetype', 'collective', 'individuation'];

  const scores = {
    mesopotamian: themes.filter(t => mesopotamianKeywords.some(k => t.toLowerCase().includes(k))).length,
    islamic: themes.filter(t => islamicKeywords.some(k => t.toLowerCase().includes(k))).length,
    jungian: themes.filter(t => jungianKeywords.some(k => t.toLowerCase().includes(k))).length,
  };

  const max = Math.max(scores.mesopotamian, scores.islamic, scores.jungian);
  if (max === 0) return 'universal';
  if (scores.mesopotamian === max) return 'mesopotamian';
  if (scores.islamic === max) return 'islamic';
  return 'jungian';
}

function buildTransitRecommendation(
  transits: Record<string, unknown>,
  profile: AdaptivePromptContext
): string {
  // Simplified recommendation logic
  const trajectory = profile.recent_emotional_trajectory;
  const hasFearPattern = trajectory.filter(t => t === 'fearful').length >= 2;

  if (hasFearPattern) {
    return 'أنماطك الحلمية الأخيرة تحمل طاقة التحوّل. المريخ في عبوره يستحثّ المواجهة. هذا وقت للشجاعة الداخلية، لا للتراجع.';
  }

  const hasTranscendentPattern = trajectory.filter(t => t === 'transcendent').length >= 2;
  if (hasTranscendentPattern) {
    return 'أحلامك تشير إلى انفتاح روحي عميق. عطارد الرجعي يدعوك لمراجعة الماضي بحكمة. اكتب، تأمّل، واستمع للصمت.';
  }

  return 'التوازن في أحلامك يعكس توازناً داخلياً. استمر في التأمل اليومي ومراقبة الترانزيتات القمرية.';
}
