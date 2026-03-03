'use client';

import { useState } from 'react';

export default function ChartForm() {
  const [name, setName] = useState('Hassan');
  const [date, setDate] = useState('2005-01-01');
  const [time, setTime] = useState('12:00');
  const [place, setPlace] = useState('Baghdad, Iraq');
  const [zodiac, setZodiac] = useState<'tropical' | 'sidereal'>('tropical');
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    setIsLoading(true);
    setErr('');
    setOut(null);
    try {
      // 1) Resolve place to coordinates + timezone
      const geoRes = await fetch('/api/geo/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: place }),
      });

      const geoText = await geoRes.text();
      const geo = geoText ? safeJson(geoText) : {};
      if (!geoRes.ok) {
        setErr(geo?.message ?? 'Failed to resolve location');
        return;
      }

      // 2) Request chart with canonical schema expected by the API route
      const res = await fetch('/api/astro/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: date,
          birth_time: time,
          birth_timezone: geo.timezone ?? 'UTC',
          lat: Number(geo.lat),
          lng: Number(geo.lng),
          zodiac_type: zodiac,
          house_system: 'placidus',
          // name is currently UI-only; keeping it client-side
          _name: name,
        }),
      });
      const text = await res.text();
      const data = text ? safeJson(text) : {};
      if (!res.ok) {
        setErr(data?.message ?? data?.error ?? 'Request failed');
        return;
      }
      setOut(data);
    } catch (e: any) {
      setErr((e as any)?.message ?? 'Network error');
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
    <div className="glass-panel glass-panel-glow p-6 space-y-4 max-w-3xl mx-auto">
      <div className="text-lg font-semibold">مخطط الميلاد (نموذج MVP)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" placeholder="المكان" value={place} onChange={(e) => setPlace(e.target.value)} />
        <input className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <select className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" value={zodiac} onChange={(e) => setZodiac(e.target.value as any)}>
          <option value="tropical">Western Tropical</option>
          <option value="sidereal">Sidereal (Vedic)</option>
        </select>
      </div>

      <button className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-purple-500/70 via-cyan-500/60 to-blue-500/70 hover:from-purple-400/80 hover:to-blue-400/80 transition disabled:opacity-50 disabled:cursor-not-allowed" onClick={submit} disabled={isLoading}>
        {isLoading ? 'جاري الحساب…' : 'احسب المخطط'}
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
