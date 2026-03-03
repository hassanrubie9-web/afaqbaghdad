// app/api/user/profile/route.ts
// ============================================================
// AETHER BAGHDAD v2.0 — User Profile API
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/db/supabase-server';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateRequest, sanitizeText } from '@/lib/security/validator';
import { logger } from '@/lib/security/logger';

const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(80).transform(sanitizeText).optional(),
  birth_data: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().min(1).max(60),
  }).optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    city: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    countryCode: z.string().length(2),
  }).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('uuid, email, display_name, birth_data, coordinates, learning_profile, subscription_tier, created_at')
      .eq('uuid', user.id)
      .single();

    if (error || !profile) {
      // Auto-create profile if it doesn't exist
      const { data: newProfile } = await supabase
        .from('users')
        .insert({ uuid: user.id, email: user.email ?? '' })
        .select()
        .single();

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);

  } catch (error) {
    logger.error('Profile fetch failed', { error: String(error) });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const rl = await rateLimit(req, { windowMs: 60_000, max: 20, keyPrefix: 'user:profile' });
    if (!rl.success) {
      return NextResponse.json({ code: 'RATE_LIMITED' }, { status: 429 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await validateRequest(req, UpdateProfileSchema);

    const { data, error } = await supabase
      .from('users')
      .update(body)
      .eq('uuid', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Profile update failed', { userId: user.id, error: error.message });
      return NextResponse.json({ code: 'UPDATE_FAILED', message: error.message }, { status: 400 });
    }

    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
