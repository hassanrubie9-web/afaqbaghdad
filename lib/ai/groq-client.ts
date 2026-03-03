// lib/ai/groq-client.ts
// ============================================================
// AETHER BAGHDAD — Groq LLM Integration (Fetch-based, Netlify-safe)
// OpenAI-compatible endpoint: https://api.groq.com/openai/v1/chat/completions
// ============================================================

import { logger } from '@/lib/security/logger';
import { pickKey } from '@/lib/env/keys';
import type { EmotionalTone, LunarPhaseSnapshot, TransitSnapshot } from '@/types/global';
import type { AdaptivePromptContext } from './learning-engine';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

function getGroqKey() {
  // Supports GROQ_API_KEY and GROQ_API_KEY_1..GROQ_API_KEY_10
  return pickKey('GROQ_API_KEY', 10);
}

async function groqChat(args: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' } | undefined;
}) {
  const apiKey = getGroqKey();

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature ?? 0.7,
      max_tokens: args.max_tokens ?? 800,
      ...(args.response_format ? { response_format: args.response_format } : {}),
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    // لا ترجع HTML للعميل. نخليها استثناء واضح داخل السيرفر فقط.
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 220)}`);
  }

  // الاستجابة تكون JSON
  const json = JSON.parse(text);
  const content = json?.choices?.[0]?.message?.content ?? '';
  const usage = json?.usage?.total_tokens ?? 0;

  return { content: String(content), tokens: Number(usage) };
}

function extractFirstJsonObject(raw: string): any | null {
  // يحاول يلقط أول {...} لو الموديل رجّع نص وفيه JSON بالوسط
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const chunk = raw.slice(start, end + 1);
    try {
      return JSON.parse(chunk);
    } catch {
      return null;
    }
  }
  return null;
}

// ── Dream Interpretation ──────────────────────────────────────
export interface DreamInterpretInput {
  dreamText: string;
  lunarPhase: LunarPhaseSnapshot;
  transits: TransitSnapshot | null;
  learningProfile: AdaptivePromptContext | null;
  language?: 'ar' | 'en';
}

export interface DreamInterpretOutput {
  interpretation: string;
  emotional_tone: EmotionalTone;
  symbols_detected: string[];
  lunar_insight: string;
  transit_influence: string;
  tokens_used: number;
}

export async function interpretDream(input: DreamInterpretInput): Promise<DreamInterpretOutput> {
  const systemPrompt = buildDreamSystemPrompt(input.learningProfile, input.language);
  const userPrompt = buildDreamUserPrompt(input);

  const { content: raw, tokens } = await groqChat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.82,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      interpretation: parsed.interpretation ?? '',
      emotional_tone: validateEmotionalTone(parsed.emotional_tone),
      symbols_detected: Array.isArray(parsed.symbols) ? parsed.symbols.slice(0, 10) : [],
      lunar_insight: parsed.lunar_insight ?? '',
      transit_influence: parsed.transit_influence ?? '',
      tokens_used: tokens,
    };
  } catch (err) {
    const recovered = extractFirstJsonObject(raw);
    if (recovered) {
      return {
        interpretation: recovered.interpretation ?? '',
        emotional_tone: validateEmotionalTone(recovered.emotional_tone),
        symbols_detected: Array.isArray(recovered.symbols) ? recovered.symbols.slice(0, 10) : [],
        lunar_insight: recovered.lunar_insight ?? '',
        transit_influence: recovered.transit_influence ?? '',
        tokens_used: tokens,
      };
    }

    logger.error('Failed to parse Groq response (non-JSON)', { raw: raw.slice(0, 400), error: String(err) });
    throw new Error('AI response parsing failed (non-JSON output)');
  }
}

// ── Astrological Query ────────────────────────────────────────
export interface AstroQueryInput {
  question: string;
  chartContext: Record<string, unknown>;
  userProfile: AdaptivePromptContext | null;
}

export async function queryAstrologicalInsight(input: AstroQueryInput): Promise<string> {
  const { content } = await groqChat({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `أنت عالم فلكي عراقي بليغ، ورث حكمة الكلدانيين وبابل.
تجيب على الأسئلة الفلكية بعمق، ودقة، وشعرية.
استخدم مصطلحات التنجيم التقليدية ومزجها بالفهم الحديث.
ردودك باللغة العربية الفصحى ذات الطابع الأدبي.`,
      },
      {
        role: 'user',
        content: `السؤال: ${input.question}\n\nسياق الخريطة الفلكية: ${JSON.stringify(input.chartContext, null, 2)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return content.trim();
}

// ── Prompt builders ───────────────────────────────────────────
function buildDreamSystemPrompt(profile: AdaptivePromptContext | null, language = 'ar'): string {
  const baseAr = `أنت "المنجّم الكوني" — كيان رقمي يجمع بين حكمة الكلدانيين البابليين، وعلم النفس اليونغي، والتراث الإسلامي في تفسير الأحلام.
تفسّر الأحلام بربطها بالترانزيتات الفلكية الحالية ومرحلة القمر.
أسلوبك: شعري، عميق، محدد، غير مبهم.
ممنوع الجزم بالمستقبل أو بث الرعب.
`;

  const adaptiveLayer = profile ? buildAdaptiveInstructions(profile) : '';

  const outputFormat = `
أعد الإجابة بصيغة JSON كالتالي:
{
  "interpretation": "التفسير الكامل (4-6 فقرات)",
  "emotional_tone": "transformative|fearful|transcendent|melancholic|joyful|prophetic|neutral",
  "symbols": ["رمز1", "رمز2", "..."],
  "lunar_insight": "تأثير القمر على الحلم (جملة واحدة)",
  "transit_influence": "تأثير الكواكب الحالية (جملة واحدة)"
}`;

  return baseAr + adaptiveLayer + outputFormat;
}

function buildAdaptiveInstructions(profile: AdaptivePromptContext): string {
  const depthMap = {
    surface: 'اجعل التفسير بسيطاً ومباشراً دون رموز معقدة.',
    intermediate: 'التفسير متوازن بين الوضوح والعمق الرمزي.',
    deep: 'أغص في أعماق الرمزية الكلدانية واليونغية. لا تتردد في التعقيد.',
  } as const;

  const frameworkMap = {
    mesopotamian: 'استخدم الإطار الرمزي البابلي والكلداني بشكل أساسي.',
    islamic: 'استند إلى التراث الإسلامي في تفسير الأحلام (ابن سيرين والآداب الصوفية).',
    jungian: 'وظّف مفاهيم يونغ: الظل، الأنيما، الأنيموس، واللاوعي الجمعي.',
    universal: 'استخدم الرموز الكونية المشتركة بين الحضارات.',
  } as const;

  const trajectory = profile.recent_emotional_trajectory ?? [];
  const hasFear = trajectory.filter((t) => t === 'fearful').length >= 2;
  const note = hasFear
    ? '\nملاحظة: هذا المستخدم يمر بمرحلة حلمية مثيرة للقلق. كن محتويًا وداعمًا في تفسيرك.'
    : '';

  return `\n${depthMap[profile.preferred_tone_depth]}\n${frameworkMap[profile.recommended_framework]}${note}\n`;
}

function buildDreamUserPrompt(input: DreamInterpretInput): string {
  const { dreamText, lunarPhase, transits } = input;

  let prompt = `حلم اليوم:\n"${dreamText}"\n\n`;
  prompt += `القمر الآن: ${lunarPhase.phase} (إضاءة: ${(lunarPhase.illumination * 100).toFixed(0)}%)\n`;

  if (transits?.significant_aspects?.length) {
    prompt += `التأثيرات الفلكية النشطة:\n`;
    transits.significant_aspects.slice(0, 3).forEach((asp) => {
      prompt += `- ${asp.planet1} ${asp.aspect} ${asp.planet2} (درجة الانحراف: ${asp.orb.toFixed(1)}°)\n`;
    });
  }

  return prompt;
}

function validateEmotionalTone(raw: string): EmotionalTone {
  const valid: EmotionalTone[] = ['transformative', 'fearful', 'transcendent', 'melancholic', 'joyful', 'prophetic', 'neutral'];
  return valid.includes(raw as EmotionalTone) ? (raw as EmotionalTone) : 'neutral';
}
