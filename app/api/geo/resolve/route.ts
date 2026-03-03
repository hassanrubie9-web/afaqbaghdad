// app/api/geo/resolve/route.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Geolocation Resolution Engine
// OpenCage + TimeZoneDB integration
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limiter';
import { validateRequest } from '@/lib/security/validator';
import { getFromCache, setCache } from '@/lib/cache/memory-cache';
import type { GeoResolveResponse } from '@/types/global';
import { pickKey, hasAnyKey } from '@/lib/env/keys';

const GeoResolveSchema = z.object({
  // دعم طريقتين: query واحد أو city+country
  query: z.string().min(2).max(200).trim().optional(),
  city: z.string().min(2).max(120).trim().optional(),
  country: z.string().min(2).max(120).trim().optional(),
}).refine((v) => Boolean(v.query || (v.city && v.country)), {
  message: 'يجب إرسال query أو (city + country)',
});


export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, { windowMs: 60_000, max: 30, keyPrefix: 'geo:resolve' });
    if (!rl.success) {
      return NextResponse.json({ code: 'RATE_LIMITED' }, { status: 429 });
    }

    const body = await validateRequest(req, GeoResolveSchema);

    const query = body.query ?? `${body.city}, ${body.country}`;

    if (!hasAnyKey('OPENCAGE_API_KEY', 10) || !hasAnyKey('TIMEZONEDB_API_KEY', 10)) {
      return NextResponse.json(
        {
          code: 'MISSING_ENV',
          message: 'Missing OPENCAGE_API_KEY and/or TIMEZONEDB_API_KEY. Add them to .env.local (local) or Secrets (Netlify/Replit).',
        },
        { status: 500 }
      );
    }

    // Check cache first
    const cacheKey = `geo:${query.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = getFromCache<GeoResolveResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    // OpenCage geocoding
    const opencageUrl = new URL('https://api.opencagedata.com/geocode/v1/json');
    opencageUrl.searchParams.set('q', query);
    opencageUrl.searchParams.set('key', pickKey('OPENCAGE_API_KEY', 10));
    opencageUrl.searchParams.set('limit', '1');
    opencageUrl.searchParams.set('language', 'ar');
    opencageUrl.searchParams.set('no_annotations', '0');

    const geoRes = await fetch(opencageUrl.toString(), {
      next: { revalidate: 3600 },
    });

    if (!geoRes.ok) {
      throw new Error(`OpenCage API error: ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    const result = geoData.results?.[0];

    if (!result) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Location not found' },
        { status: 404 }
      );
    }

    const { lat, lng } = result.geometry;
    const components = result.components;

    // Fetch timezone from TimeZoneDB
    const tzUrl = new URL('https://api.timezonedb.com/v2.1/get-time-zone');
    tzUrl.searchParams.set('key', pickKey('TIMEZONEDB_API_KEY', 10));
    tzUrl.searchParams.set('format', 'json');
    tzUrl.searchParams.set('by', 'position');
    tzUrl.searchParams.set('lat', String(lat));
    tzUrl.searchParams.set('lng', String(lng));

    const tzRes = await fetch(tzUrl.toString());
    const tzData = await tzRes.json();

    const response: GeoResolveResponse = {
      city: components.city || components.town || components.village || components.county || '',
      country: components.country || '',
      countryCode: components.country_code?.toUpperCase() || '',
      lat,
      lng,
      timezone: tzData.zoneName || result.annotations?.timezone?.name || 'UTC',
      utcOffset: tzData.gmtOffset || 0,
      formatted: result.formatted,
    };

    // Cache for 24 hours
    setCache(cacheKey, response, 86_400_000);

    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Geolocation service unavailable' }, { status: 500 });
  }
}
