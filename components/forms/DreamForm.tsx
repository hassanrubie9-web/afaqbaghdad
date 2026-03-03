'use client';

import { useState } from 'react';

export default function DreamForm() {
  const [dream, setDream] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [out, setOut] = useState<string>('');
  const [err, setErr] = useState<string>('');

  async function submit() {
    setIsLoading(true);
    setErr('');
    setOut('');
    try {
      const res = await fetch('/api/dream/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_text: dream, include_transits: true }),
      });
      const text = await res.text();
      const data = text ? safeJson(text) : {};
      if (!res.ok) {
        setErr(data?.message ?? data?.error ?? 'Request failed');
        return;
      }
      setOut(data?.interpretation ?? data?.text ?? JSON.stringify(data, null, 2));
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
      // Common when server returns an HTML error page.
      return { message: 'Server returned non‑JSON response', raw: raw.slice(0, 180) };
    }
  }

  return (
    <div className="glass-panel glass-panel-glow p-6 space-y-4 max-w-2xl mx-auto">
      <div className="text-lg font-semibold">بوابة تفسير الأحلام — AI</div>
      <textarea
        className="w-full min-h-[140px] rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        placeholder="اكتب حلمك هنا..."
        value={dream}
        onChange={(e) => setDream(e.target.value)}
      />
      <button className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-cyan-500/70 via-purple-500/60 to-fuchsia-500/70 hover:from-cyan-400/80 hover:to-fuchsia-400/80 transition disabled:opacity-50 disabled:cursor-not-allowed" onClick={submit} disabled={isLoading || dream.trim().length < 5}>
        {isLoading ? 'جاري التفسير…' : 'فسّر الحلم'}
      </button>
      {err ? <div className="text-sm text-red-300">{err}</div> : null}
      {out ? (
        <div className="whitespace-pre-wrap text-sm leading-7 text-white/90 border border-white/10 rounded-xl p-3 bg-white/5">
          {out}
        </div>
      ) : null}
    </div>
  );
}
