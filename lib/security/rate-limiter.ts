// lib/security/rate-limiter.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Rate Limiting Middleware
// In-memory sliding window for Edge/Node environments
// ============================================================

import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter: number;
}

// In-memory store (replace with Redis for multi-instance deployments)
const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.resetAt <= now) store.delete(key);
    }
  }, 300_000);
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { windowMs, max, keyPrefix } = options;

  // Extract client identifier: prefer user IP, fallback to forwarded IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  const key = `${keyPrefix}:${ip}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, retryAfter: 0 };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { success: true, remaining: max - entry.count, retryAfter: 0 };
}
