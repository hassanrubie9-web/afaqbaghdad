import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs"; // مهم مع Netlify/Next APIs

const ReqSchema = z.object({
  dream_text: z.string().min(5, "اكتب حلمك بشكل أوضح (5 أحرف على الأقل).").max(4000),
  include_transits: z.boolean().optional().default(true),
});

function jsonOk(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
function jsonErr(message: string, status = 500, extra?: any) {
  return NextResponse.json(
    { ok: false, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

/** يجلب مفتاح GROQ من GROQ_API_KEY_1..10 أو GROQ_API_KEY */
function pickGroqKey() {
  const direct = process.env.GROQ_API_KEY;
  if (direct) return direct;
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}` as const];
    if (k) return k;
  }
  return "";
}

async function getTransitsSafe() {
  // نجعلها آمنة 100%: إذا فشلت لا تُسقط الطلب
  try {
    // إذا عندك route transits جاهز، خذه منه. (أكثر ثباتاً داخل نفس الدومين)
    // على السيرفر نستخدم URL داخلي مطلق
    const base = process.env.URL || process.env.DEPLOY_URL
      ? `https://${process.env.DEPLOY_URL || process.env.URL}`
      : "";
    const url = base ? `${base}/api/transits/current` : `/api/transits/current`;

    const res = await fetch(url, { method: "GET" });
    const txt = await res.text();
    if (!res.ok) return null;
    try {
      return JSON.parse(txt);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function groqInterpret(args: { dreamText: string; transits: any | null }) {
  const apiKey = pickGroqKey();
  if (!apiKey) {
    // لا نرمي خطأ — نرجع fallback
    return {
      interpretation:
        "حالياً خدمة الذكاء الاصطناعي غير مفعّلة لأن GROQ_API_KEY غير موجود. " +
        "لكن بشكل عام: حاول تكتب رموز الحلم الأساسية (أشخاص/أماكن/مشاعر) ثم اربطها بأحداثك الواقعية خلال آخر أسبوع. " +
        "إذا الحلم متكرر أو مزعج، جرّب تهدئة النوم وتقليل المنبهات قبل النوم.\n\n" +
        "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      source: "fallback_no_key",
    };
  }

  const system = `
أنت مفسّر أحلام عراقي مثقف (فصحى مع لمسة بغداد خفيفة)، رحيم ودقيق.
ممنوع الجزم بالمستقبل، وممنوع لغة التخويف.
اربط الرموز بالحالة النفسية والواقع، وإذا توفرت ترانزيتات اذكرها كعامل مساعد فقط.
اختم دائماً بعبارة: "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق."
`.trim();

  const transitsHint =
    args.transits
      ? `\n\nمعلومات فلكية مساعدة (قد تكون فارغة):\n${JSON.stringify(args.transits).slice(0, 1500)}`
      : "";

  const user = `
نص الحلم:
"${args.dreamText}"
${transitsHint}

المطلوب:
- تفسير من 4 إلى 6 فقرات.
- قائمة رموز (5-10) إن أمكن.
- جملة عن تأثير القمر/المزاج (حتى لو عامة).
- نصيحتان عمليتان.
- اختم بالعبارة المطلوبة.
`.trim();

  // Groq OpenAI-compatible
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 900,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const txt = await res.text();

  if (!res.ok) {
    // لا نسقط — نرجع fallback مع رسالة مفيدة
    return {
      interpretation:
        "الخدمة غير متاحة حالياً بسبب خطأ من مزود الذكاء الاصطناعي. جرّب مرة ثانية بعد قليل.\n\n" +
        "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      source: "fallback_groq_error",
      groq_status: res.status,
      groq_raw: txt.slice(0, 220),
    };
  }

  let json: any = null;
  try {
    json = JSON.parse(txt);
  } catch {
    return {
      interpretation:
        "الخدمة غير متاحة حالياً بسبب استجابة غير مفهومة من مزود الذكاء الاصطناعي.\n\n" +
        "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      source: "fallback_groq_non_json",
      groq_raw: txt.slice(0, 220),
    };
  }

  const content = String(json?.choices?.[0]?.message?.content ?? "").trim();
  if (!content) {
    return {
      interpretation:
        "الخدمة غير متاحة حالياً (استجابة فارغة). جرّب مرة ثانية.\n\n" +
        "لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.",
      source: "fallback_empty",
    };
  }

  return { interpretation: content, source: "groq" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = ReqSchema.safeParse(body);
    if (!parsed.success) {
      return jsonErr("المدخلات غير صحيحة.", 400, parsed.error.flatten());
    }

    const { dream_text, include_transits } = parsed.data;

    // ✅ ترانزيتات آمنة — لو فشلت لا تؤثر
    const transits = include_transits ? await getTransitsSafe() : null;

    // ✅ تفسير آمن — لا يسقط السيرفر
    const ai = await groqInterpret({ dreamText: dream_text, transits });

    // رجّع JSON دائماً
    return jsonOk({
      ok: true,
      interpretation: ai.interpretation,
      meta: {
        source: ai.source,
        has_transits: Boolean(transits),
      },
    });
  } catch (e: any) {
    // JSON error response فقط
    return jsonErr("هذه الخدمة غير متاحة حالياً.", 500, {
      error: String(e?.message ?? e),
    });
  }
}
