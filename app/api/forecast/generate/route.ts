import { NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateRequest } from '@/lib/security/validator';
import { handleApiError, jsonErr, jsonOk } from '@/lib/security/api';
import { computeNatalChart } from '@/lib/astro/chart-engine';
import { getGlobalTransits } from '@/lib/astro/transits';
import { generateForecastArabic } from '@/lib/ai/forecast';
import { createServerClient } from '@/lib/db/supabase-server';
import type { HouseSystem, ZodiacTradition, ZodiacType } from '@/types/global';

const BodySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/),
  birth_timezone: z.string().min(1).max(80),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  tradition: z.enum(['western_tropical', 'sidereal_vedic', 'babylonian', 'persian', 'chinese']).default('western_tropical'),
  house_system: z.enum(['placidus', 'whole_sign', 'koch']).default('placidus'),
});

function traditionToZodiacType(t: ZodiacTradition): ZodiacType {
  return t === 'sidereal_vedic' ? 'sidereal' : 'tropical';
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, { windowMs: 60 * 60 * 1000, max: 25, keyPrefix: 'forecast:generate' });
    if (!rl.success) return jsonErr('تم تجاوز حد التوقعات. جرّب لاحقاً.', 'RATE_LIMITED', 429, { retry_after: rl.retryAfter });

    const body = await validateRequest(req, BodySchema);

    const zodiacType = traditionToZodiacType(body.tradition as ZodiacTradition);

    const natal = await computeNatalChart({
      birthDate: body.birth_date,
      birthTime: body.birth_time,
      birthTimezone: body.birth_timezone,
      lat: body.lat,
      lng: body.lng,
      houseSystem: body.house_system as HouseSystem,
      zodiacType,
    });

    const transits = await getGlobalTransits();
    const forecastText = await generateForecastArabic({
      period: body.period,
      tradition: body.tradition as ZodiacTradition,
      natal,
      transits,
    });

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let forecastId: string | undefined;
    if (user) {
      const { data, error } = await supabase
        .from('forecasts')
        .insert({
          user_uuid: user.id,
          period: body.period,
          input_snapshot: {
            birth_date: body.birth_date,
            birth_time: body.birth_time,
            birth_timezone: body.birth_timezone,
            lat: body.lat,
            lng: body.lng,
            tradition: body.tradition,
            house_system: body.house_system,
          },
          forecast_text: forecastText,
        })
        .select('id')
        .single();
      if (!error) forecastId = data?.id;
    }

    return jsonOk({
      forecast_text: forecastText,
      forecast_id: forecastId,
      disclaimer: 'لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
