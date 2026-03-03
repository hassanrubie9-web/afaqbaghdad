import { pickKey, hasAnyKey } from '@/lib/env/keys';
import type { NatalChart, TransitSnapshot, ZodiacTradition } from '@/types/global';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function groqText(args: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const apiKey = pickKey('GROQ_API_KEY', 10);

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: args.temperature ?? 0.65,
      max_tokens: args.max_tokens ?? 900,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${text.slice(0, 220)}`);

  const json = JSON.parse(text);
  return String(json?.choices?.[0]?.message?.content ?? '').trim();
}

export async function generateForecastArabic(args: {
  period: 'daily' | 'weekly' | 'monthly';
  tradition: ZodiacTradition;
  natal: NatalChart;
  transits: TransitSnapshot;
}): Promise<string> {
  if (!hasAnyKey('GROQ_API_KEY', 10)) {
    return [
      'لا يتوفر نموذج الذكاء الاصطناعي حالياً (GROQ_API_KEY غير موجود).',
      'نصيحة عامة: ركّز على الروتين الصحي، وراقب مزاجك، وخلي القرارات الكبيرة بعد ما تهدأ الصورة.',
      'لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.',
    ].join('\n');
  }

  const periodAr = args.period === 'daily' ? 'اليوم' : args.period === 'weekly' ? 'هذا الأسبوع' : 'هذا الشهر';

  const system = `
أنت "المهندس المعماري الفلكي" بأسلوب عراقي مثقف (فصحى مع لمسة بغداد خفيفة)، علمي ورحيم.
ممنوع الجزم بالمستقبل. استخدم احتمالات ونصائح.
اختم دائماً بعبارة: "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق."
`.trim();

  const user = `
أريد توقعاً عربياً لـ ${periodAr}.
التقليد المختار: ${args.tradition}
بيانات الخريطة (ملخص):
- الطالع: ${args.natal.ascendant?.sign} ${Number(args.natal.ascendant?.degree ?? 0).toFixed(1)}°
- MC: ${args.natal.midheaven?.sign} ${Number(args.natal.midheaven?.degree ?? 0).toFixed(1)}°
- الجوانب المهمة: ${(args.natal.aspects ?? [])
    .slice(0, 10)
    .map((a) => `${a.planet1}-${a.aspect}-${a.planet2} (orb ${a.orb})`)
    .join(', ')}

ترانزيت اليوم (مختصر):
- كواكب: ${(args.transits.planets ?? [])
    .slice(0, 10)
    .map((p) => `${p.name} في ${p.sign} ${p.degree}°`)
    .join(', ')}
- جوانب قوية: ${(args.transits.significant_aspects ?? [])
    .slice(0, 10)
    .map((a) => `${a.planet1} ${a.aspect} ${a.planet2} (orb ${a.orb})`)
    .join(', ')}

المطلوب:
1) 3 سيناريوهات محتملة (فرصة/تحدي/توازن) مع نسبة تقريبية (مثلاً 60%).
2) 5 نصائح عملية قابلة للتطبيق.
3) فقرة قصيرة تطمينية غير مخيفة.
4) عدم استخدام لغة رعب أو حتمية.
`.trim();

  try {
    const text = await groqText({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.65,
      max_tokens: 900,
    });

    return text || 'تعذر توليد النص حالياً. لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.';
  } catch {
    return 'تعذر توليد النص حالياً. لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.';
  }
}
