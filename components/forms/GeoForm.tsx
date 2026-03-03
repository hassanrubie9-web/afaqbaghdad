'use client';

import { useState } from 'react';

export default function GeoForm() {
  const [place, setPlace] = useState('Baghdad, Iraq');
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    setIsLoading(true);
    setErr('');
    setOut(null);
    try {
      const res = await fetch('/api/geo/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: place }),
      });
      const text = await res.text();
      const data = text ? safeJson(text) : {};
      if (!res.ok) {
        setErr(data?.message ?? data?.error ?? 'Request failed');
        return;
      }
      setOut(data);
    } catch (e: any) {
      setErr(e?.message ?? 'Network error');
    } finally {
      setIsLoading(false);
    }
  }

  function safeJson(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch {
      return { message: 'Server returned non‑JSON response', raw: raw.slice(0, 180) };
    }
  }

  return (
    <div className="glass-panel p-6 space-y-4 max-w-2xl mx-auto">
      <div className="text-lg font-semibold">تحديد المكان والوقت</div>
      <input className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" value={place} onChange={(e) => setPlace(e.target.value)} />
      <button className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-cyan-500/70 to-purple-500/70 hover:from-cyan-400/80 hover:to-purple-400/80 transition disabled:opacity-50 disabled:cursor-not-allowed" onClick={submit} disabled={isLoading || place.trim().length < 3}>
        {isLoading ? 'جاري التحويل…' : 'حوّل إلى إحداثيات + Timezone'}
      </button>
      {err ? <div className="text-sm text-red-300">{err}</div> : null}
      {out ? (
        <pre className="text-xs overflow-auto border border-white/10 rounded-xl p-3 bg-white/5">
{JSON.stringify(out, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
