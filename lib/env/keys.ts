// lib/env/keys.ts
// ============================================================
// Helpers for handling multiple API keys (key pools) safely.
// ============================================================

function readKeyPool(prefix: string, max = 10): string[] {
  const keys: string[] = [];
  // Support both SINGLE and numbered keys.
  const single = process.env[prefix];
  if (single) keys.push(single);

  for (let i = 1; i <= max; i++) {
    const k = process.env[`${prefix}_${i}`];
    if (k) keys.push(k);
  }
  return Array.from(new Set(keys)).filter(Boolean);
}

export function pickKey(prefix: string, max = 10): string {
  const pool = readKeyPool(prefix, max);
  if (!pool.length) {
    throw new Error(`Missing environment variable(s): ${prefix} or ${prefix}_1..${prefix}_${max}`);
  }
  // Simple random pick. (Good enough; avoids hammering one key.)
  return pool[Math.floor(Math.random() * pool.length)];
}

export function hasAnyKey(prefix: string, max = 10): boolean {
  return readKeyPool(prefix, max).length > 0;
}
