import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limiter';
import { getGlobalTransits } from '@/lib/astro/transits';
import { jsonErr, jsonOk, handleApiError } from '@/lib/security/api';

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, { windowMs: 60 * 1000, max: 30, keyPrefix: 'transits:current' });
    if (!rl.success) return jsonErr('تم تجاوز حد الطلبات. جرّب بعد قليل.', 'RATE_LIMITED', 429, { retry_after: rl.retryAfter });

    const snapshot = await getGlobalTransits();
    return jsonOk({ transits: snapshot });
  } catch (err) {
    return handleApiError(err);
  }
}
