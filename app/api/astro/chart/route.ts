// app/api/astro/chart/route.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Natal Chart Computation Engine
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/db/supabase-server';
import { computeNatalChart } from '@/lib/astro/chart-engine';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateRequest } from '@/lib/security/validator';
import { logger } from '@/lib/security/logger';

const ChartRequestSchema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  birth_timezone: z.string().min(1).max(60),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  house_system: z.enum(['placidus', 'whole_sign', 'equal', 'porphyry', 'regiomontanus', 'koch']).optional().default('placidus'),
  zodiac_type: z.enum(['tropical', 'sidereal']).optional().default('tropical'),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // Rate limit: 20 charts per hour
    const rl = await rateLimit(req, { windowMs: 3_600_000, max: 20, keyPrefix: 'astro:chart' });
    if (!rl.success) {
      return NextResponse.json({ code: 'RATE_LIMITED', message: 'Chart generation limit reached' }, { status: 429 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await validateRequest(req, ChartRequestSchema);

    // Compute natal chart via external astrology API + local calculations
    const natalChart = await computeNatalChart({
      birthDate: body.birth_date,
      birthTime: body.birth_time,
      birthTimezone: body.birth_timezone,
      lat: body.lat,
      lng: body.lng,
      houseSystem: body.house_system,
      zodiacType: body.zodiac_type,
    });

    // Persist if authenticated
    let chartId: string | undefined;
    if (user) {
      const { data: chart } = await supabase
        .from('astro_charts')
        .insert({
          user_uuid: user.id,
          chart_type: 'natal',
          natal_chart: natalChart,
          house_system: body.house_system,
          zodiac_type: body.zodiac_type,
        })
        .select('id')
        .single();

      chartId = chart?.id;
    }

    logger.info('Natal chart computed', {
      requestId,
      userId: user?.id ?? 'anonymous',
      houseSystem: body.house_system,
    });

    return NextResponse.json({ chart: natalChart, chart_id: chartId }, { status: 200 });

  } catch (error) {
    logger.error('Chart computation failed', { requestId, error: String(error) });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Chart engine unavailable' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chartId = searchParams.get('id');

    if (chartId) {
      const { data, error } = await supabase
        .from('astro_charts')
        .select('*')
        .eq('id', chartId)
        .eq('user_uuid', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    // List user's charts
    const { data: charts } = await supabase
      .from('astro_charts')
      .select('id, chart_type, house_system, zodiac_type, created_at')
      .eq('user_uuid', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ charts: charts ?? [] });

  } catch (error) {
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
