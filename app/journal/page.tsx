'use client';
// app/journal/page.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/i18n/LangProvider';
import { BookOpen, Plus, Trash2, BarChart2, Moon } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;        // ISO date string
  mood: number;        // 1-5
  notes: string;
  lunarPhase: string;  // computed approximate
  createdAt: number;
}

const LUNAR_PHASES_AR = ['🌑 محاق','🌒 هلال','🌓 تربيع أول','🌔 أحدب','🌕 بدر','🌖 أحدب','🌗 تربيع أخير','🌘 هلال'];
const LUNAR_PHASES_EN = ['🌑 New','🌒 Waxing Crescent','🌓 First Quarter','🌔 Waxing Gibbous','🌕 Full','🌖 Waning Gibbous','🌗 Last Quarter','🌘 Waning Crescent'];

function approximateLunarPhase(dateStr: string, lang: 'ar' | 'en'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return lang === 'ar' ? '🌕 بدر' : '🌕 Full';
  // Approximate: reference new moon Jan 1 2024, period 29.53 days
  const ref = new Date('2024-01-11').getTime();
  const diff = d.getTime() - ref;
  const days = diff / 86400000;
  const phase = ((days % 29.53) + 29.53) % 29.53;
  const idx = Math.floor(phase / (29.53 / 8));
  const phases = lang === 'ar' ? LUNAR_PHASES_AR : LUNAR_PHASES_EN;
  return phases[Math.min(idx, 7)];
}

const MOOD_LABELS_AR = ['', 'تعيس جداً 😞', 'سيء 😟', 'عادي 😐', 'جيد 😊', 'رائع 😄'];
const MOOD_LABELS_EN = ['', 'Very low 😞', 'Low 😟', 'Neutral 😐', 'Good 😊', 'Great 😄'];

const STORAGE_KEY = 'aether_journal_v1';

function loadEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveEntries(entries: JournalEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  catch {}
}

export default function JournalPage() {
  const { lang } = useLang();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Form state
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood]   = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => { setEntries(loadEntries()); }, []);

  const addEntry = useCallback(() => {
    if (!notes.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date,
      mood,
      notes: notes.trim(),
      lunarPhase: approximateLunarPhase(date, lang),
      createdAt: Date.now(),
    };
    const next = [entry, ...entries];
    setEntries(next);
    saveEntries(next);
    setNotes('');
    setMood(3);
    setShowForm(false);
  }, [date, mood, notes, entries, lang]);

  const deleteEntry = useCallback((id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  }, [entries]);

  // Analytics: average mood per lunar phase
  const analytics = (() => {
    const map: Record<string, number[]> = {};
    entries.forEach((e) => {
      if (!map[e.lunarPhase]) map[e.lunarPhase] = [];
      map[e.lunarPhase].push(e.mood);
    });
    return Object.entries(map).map(([phase, moods]) => ({
      phase,
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    })).sort((a, b) => b.avg - a.avg);
  })();

  const moodLabels = lang === 'ar' ? MOOD_LABELS_AR : MOOD_LABELS_EN;

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <BookOpen className="h-4 w-4" style={{ color: 'var(--neon-purple)' }} />
          {lang === 'ar' ? 'يومياتك الشخصية' : 'Your Personal Diary'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {lang === 'ar' ? 'يوميات الفلك' : 'Astro Journal'}
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          {lang === 'ar'
            ? 'سجّل مزاجك ويومياتك. اكتشف متى تشعر بنشاط أعلى مرتبطاً بالقمر.'
            : 'Log your mood and daily thoughts. Discover when you feel most energised in sync with the moon.'}
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => { setShowForm(!showForm); setShowAnalytics(false); }}
          className="rounded-2xl font-semibold gap-2"
          style={{ background: 'linear-gradient(135deg,var(--neon-purple),var(--neon-cyan))', color: '#000' }}
        >
          <Plus className="h-4 w-4" />
          {lang === 'ar' ? 'إضافة يومية' : 'New Entry'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => { setShowAnalytics(!showAnalytics); setShowForm(false); }}
          className="rounded-2xl gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          {lang === 'ar' ? 'التحليلات' : 'Analytics'}
        </Button>
      </div>

      {/* New entry form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
          >
            <Card className="glass-panel p-6 space-y-5">
              <h2 className="font-semibold text-white">
                {lang === 'ar' ? 'يومية جديدة' : 'New Entry'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60">
                    {lang === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[var(--neon-cyan)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-white/60">
                    {lang === 'ar' ? 'المزاج' : 'Mood'} — {moodLabels[mood]}
                  </label>
                  <input
                    type="range" min="1" max="5" value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="accent-[var(--neon-cyan)] mt-2"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60">
                  {lang === 'ar' ? 'ملاحظاتك' : 'Your Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={lang === 'ar' ? 'اكتب ما تشعر به اليوم…' : 'Write what you feel today…'}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[var(--neon-cyan)] focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={addEntry} disabled={!notes.trim()} className="rounded-2xl">
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-2xl">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics */}
      <AnimatePresence>
        {showAnalytics && analytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
          >
            <Card className="glass-panel p-6 space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-300" />
                {lang === 'ar' ? 'متى تشعر بنشاط أعلى؟' : 'When do you feel most energised?'}
              </h2>
              <div className="space-y-3">
                {analytics.map(({ phase, avg, count }) => (
                  <div key={phase} className="flex items-center gap-3">
                    <span className="w-44 text-sm text-white/80 truncate">{phase}</span>
                    <div className="flex-1 rounded-full bg-white/10 h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(avg / 5) * 100}%`,
                          background: 'linear-gradient(90deg,var(--neon-cyan),var(--neon-purple))',
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/50">{avg.toFixed(1)} ({count})</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      <div className="space-y-4">
        {entries.length === 0 && (
          <Card className="glass-panel p-10 text-center text-white/50">
            {lang === 'ar' ? 'لا يوجد يوميات بعد. أضف أولى يومياتك!' : 'No entries yet. Add your first entry!'}
          </Card>
        )}
        {entries.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Card className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-white/60">{e.date}</span>
                    <span className="text-white/80">{moodLabels[e.mood]}</span>
                    <span className="text-white/50 text-xs">{e.lunarPhase}</span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{e.notes}</p>
                </div>
                <button
                  onClick={() => deleteEntry(e.id)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
