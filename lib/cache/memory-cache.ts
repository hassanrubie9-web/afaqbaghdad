// lib/cache/memory-cache.ts
// ============================================================
// AETHER BAGHDAD v2.0 — In-Memory Cache
// TTL-based caching for planetary data, geo lookups, etc.
// ============================================================

interface CacheEntry<T> {
  data: T;
  expires_at: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// Auto-cleanup expired entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (entry.expires_at <= now) cache.delete(key);
    }
  }, 60_000); // Clean every minute
}

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires_at <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expires_at: Date.now() + ttlMs });
}

export function deleteFromCache(key: string): void {
  cache.delete(key);
}

export function clearCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  return { size: cache.size, keys: Array.from(cache.keys()) };
}
