// lib/astro/transits.ts
// ============================================================
// AETHER BAGHDAD v3 — Global Transits Cache
// L1: Memory, L2: Supabase transits_cache, L3: astrology-api.io
// ============================================================

import { getFromCache, setCache } from '@/lib/cache/memory-cache';
import { createAdminClient } from '@/lib/db/supabase-server';
import { logger } from '@/lib/security/logger';
import { pickKey, hasAnyKey } from '@/lib/env/keys';
import type { TransitSnapshot } from '@/types/global';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (free-tier friendly)

export async function getGlobalTransits(): Promise<TransitSnapshot> {
  const now = new Date();
  const slot = `${now.toISOString().slice(0, 13)}:00:00.000Z`; // hour slot UTC
  const cacheKey = `transits:${slot}`;

  // L1 memory
  const mem = getFromCache<TransitSnapshot>(cacheKey);
  if (mem) return mem;

  // L2 Supabase cache (service role, shared)
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('transits_cache')
      .select('positions, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data?.positions) {
      const snapshot = data.positions as TransitSnapshot;
      setCache(cacheKey, snapshot, CACHE_TTL_MS);
      return snapshot;
    }
  } catch {
    // ignore: Supabase may not be configured
  }

  // L3 external API
  try {
    const snapshot = await fetchTransitsFromAPI();
    setCache(cacheKey, snapshot, CACHE_TTL_MS);

    // store
    try {
      const supabase = createAdminClient();
      await supabase.from('transits_cache').insert({ positions: snapshot });
    } catch {}

    return snapshot;
  } catch (err) {
    logger.error('Failed to fetch transits', { error: String(err) });
    return { planets: [], significant_aspects: [], date: now.toISOString() };
  }
}

async function fetchTransitsFromAPI(): Promise<TransitSnapshot> {
  const today = new Date().toISOString().split('T')[0];

  if (!hasAnyKey('ASTROLOGY_API_KEY', 10)) {
    return { planets: [], significant_aspects: [], date: new Date().toISOString() };
  }

  const response = await fetch(`https://astrology-api.io/api/v1/transits?date=${today}&lat=33.3152&lng=44.3661`, {
    headers: { 'X-API-Key': pickKey('ASTROLOGY_API_KEY', 10) },
    // Next cache hint
    next: { revalidate: Math.floor(CACHE_TTL_MS / 1000) },
  });

  if (!response.ok) throw new Error(`Transit API error: ${response.status}`);

  const data = await response.json();
  return transformTransitData(data);
}

function transformTransitData(data: Record<string, unknown>): TransitSnapshot {
  const planets = ((data.planets as any[]) ?? []).map((p: Record<string, unknown>) => ({
    name: String(p.name),
    symbol: getPlanetSymbol(String(p.name)),
    sign: String(p.sign),
    degree: Number(p.degree),
    minute: Number(p.minute || 0),
    house: Number(p.house || 0),
    retrograde: Boolean(p.retrograde),
  }));

  const aspects = ((data.aspects as any[]) ?? []).map((a: Record<string, unknown>) => ({
    planet1: String(a.planet1),
    planet2: String(a.planet2),
    aspect: String(a.aspect),
    orb: Number(a.orb),
    applying: Boolean(a.applying),
  }));

  return {
    planets,
    significant_aspects: aspects.filter((a) => Number(a.orb) <= 3).slice(0, 12),
    date: new Date().toISOString(),
  };
}

function getPlanetSymbol(name: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };
  return symbols[name] ?? '★';
}
