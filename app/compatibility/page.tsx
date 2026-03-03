'use client';
// app/compatibility/page.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/i18n/LangProvider';
import { Heart, Star, AlertCircle } from 'lucide-react';

interface PersonForm {
  name: string;
  birth_date: string;
  birth_time: string;
  city: string;
}

const emptyPerson = (): PersonForm => ({
  name: '', birth_date: '', birth_time: '', city: '',
});

function Field({
  label, value, onChange, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[var(--neon-cyan)] focus:outline-none"
      />
    </div>
  );
}

const SIGN_COMPAT: Record<string, { element: string; modality: string }> = {
  Aries:       { element: 'fire',  modality: 'cardinal' },
  Taurus:      { element: 'earth', modality: 'fixed'    },
  Gemini:      { element: 'air',   modality: 'mutable'  },
  Cancer:      { element: 'water', modality: 'cardinal' },
  Leo:         { element: 'fire',  modality: 'fixed'    },
  Virgo:       { element: 'earth', modality: 'mutable'  },
  Libra:       { element: 'air',   modality: 'cardinal' },
  Scorpio:     { element: 'water', modality: 'fixed'    },
  Sagittarius: { element: 'fire',  modality: 'mutable'  },
  Capricorn:   { element: 'earth', modality: 'cardinal' },
  Aquarius:    { element: 'air',   modality: 'fixed'    },
  Pisces:      { element: 'water', modality: 'mutable'  },
};

function sunSignFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Aries';
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius';
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn';
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

const ELEMENT_AR: Record<string, string> = {
  fire: 'نار 🔥', earth: 'تراب 🌍', air: 'هواء 💨', water: 'ماء 💧',
};
const SIGN_AR: Record<string, string> = {
  Aries: 'الحمل ♈', Taurus: 'الثور ♉', Gemini: 'الجوزاء ♊', Cancer: 'السرطان ♋',
  Leo: 'الأسد ♌', Virgo: 'العذراء ♍', Libra: 'الميزان ♎', Scorpio: 'العقرب ♏',
  Sagittarius: 'القوس ♐', Capricorn: 'الجدي ♑', Aquarius: 'الدلو ♒', Pisces: 'الحوت ♓',
};

function computeCompatibility(a: string, b: string) {
  const ia = SIGN_COMPAT[a] ?? { element: 'fire', modality: 'cardinal' };
  const ib = SIGN_COMPAT[b] ?? { element: 'fire', modality: 'cardinal' };
  let score = 50;
  const notes: { ar: string; en: string }[] = [];

  if (ia.element === ib.element) {
    score += 25;
    notes.push({ ar: 'عنصر مشترك — تناغم عميق وتفاهم طبيعي.', en: 'Shared element — deep harmony and natural understanding.' });
  } else if (
    (ia.element === 'fire' && ib.element === 'air') ||
    (ia.element === 'air'  && ib.element === 'fire') ||
    (ia.element === 'earth' && ib.element === 'water') ||
    (ia.element === 'water' && ib.element === 'earth')
  ) {
    score += 15;
    notes.push({ ar: 'عناصر متكاملة — يقوي كل منكما الآخر.', en: 'Complementary elements — you strengthen each other.' });
  } else {
    score -= 5;
    notes.push({ ar: 'عناصر مختلفة — تنوع يثري العلاقة مع تحدٍّ.', en: 'Different elements — diversity enriches but requires effort.' });
  }

  if (ia.modality === ib.modality) {
    if (ia.modality === 'fixed') {
      score -= 10;
      notes.push({ ar: 'كلاكما ثابت — إصرار متبادل قد يسبب احتكاكاً.', en: 'Both fixed — mutual stubbornness may cause friction.' });
    } else {
      score += 10;
      notes.push({ ar: 'نفس الطريقة في التعامل مع الحياة — سهولة في التنسيق.', en: 'Same life approach — easy coordination.' });
    }
  }

  const signs = [a, b].sort().join('-');
  if (['Aries-Libra','Cancer-Capricorn','Gemini-Sagittarius','Leo-Aquarius','Taurus-Scorpio','Pisces-Virgo'].includes(signs)) {
    notes.push({ ar: 'علاقة أقطاب متعاكسة — جذب قوي مع حاجة لتوازن.', en: 'Opposite signs — strong attraction with a need for balance.' });
    score += 5;
  }

  return { score: Math.min(100, Math.max(0, score)), notes };
}

export default function CompatibilityPage() {
  const { t, lang } = useLang();
  const [p1, setP1] = useState<PersonForm>(emptyPerson());
  const [p2, setP2] = useState<PersonForm>(emptyPerson());
  const [result, setResult] = useState<{
    score: number;
    notes: { ar: string; en: string }[];
    sign1: string;
    sign2: string;
  } | null>(null);

  function update1(k: keyof PersonForm) { return (v: string) => setP1((f) => ({ ...f, [k]: v })); }
  function update2(k: keyof PersonForm) { return (v: string) => setP2((f) => ({ ...f, [k]: v })); }

  function calculate() {
    const s1 = sunSignFromDate(p1.birth_date);
    const s2 = sunSignFromDate(p2.birth_date);
    const { score, notes } = computeCompatibility(s1, s2);
    setResult({ score, notes, sign1: s1, sign2: s2 });
    window.scrollTo({ top: 600, behavior: 'smooth' });
  }

  const scoreColor =
    (result?.score ?? 0) >= 70 ? 'var(--neon-cyan)' :
    (result?.score ?? 0) >= 45 ? '#facc15' : '#f87171';

  return (
    <div className="mx-auto max-w-5xl px-4 py-24 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <Heart className="h-4 w-4" style={{ color: '#f87171' }} />
          {lang === 'ar' ? 'علم التوافق الفلكي' : 'Synastry Compatibility'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {t('compatibility.title')}
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          {lang === 'ar'
            ? 'أدخل بيانات شخصين لاكتشاف مدى التناغم الفلكي بينهما.'
            : 'Enter two profiles to discover their astrological harmony.'}
        </p>
      </motion.div>

      {/* Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: t('compatibility.person1'), form: p1, update: update1 },
          { title: t('compatibility.person2'), form: p2, update: update2 },
        ].map(({ title, form, update }, fi) => (
          <motion.div
            key={fi}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: fi * 0.15 }}
          >
            <Card className="glass-panel p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="h-4 w-4" style={{ color: 'var(--neon-cyan)' }} />
                {title}
              </h2>
              <Field label={lang === 'ar' ? 'الاسم' : 'Name'} value={form.name} onChange={update('name')} />
              <Field label={t('common.birthDate')} value={form.birth_date} onChange={update('birth_date')} type="date" />
              <Field label={t('common.birthTime')} value={form.birth_time} onChange={update('birth_time')} type="time" />
              <Field label={t('common.city')} value={form.city} onChange={update('city')} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={calculate}
          disabled={!p1.birth_date || !p2.birth_date}
          className="px-8 py-3 text-base font-semibold rounded-2xl"
          style={{ background: 'linear-gradient(135deg,var(--neon-cyan),var(--neon-purple))', color: '#000' }}
        >
          {t('compatibility.calculate')}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-panel p-8 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div
                className="text-7xl font-black"
                style={{ color: scoreColor }}
              >
                {result.score}%
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <span>{SIGN_AR[result.sign1] ?? result.sign1}</span>
                <Heart className="h-4 w-4 text-red-400" />
                <span>{SIGN_AR[result.sign2] ?? result.sign2}</span>
              </div>
            </div>

            <div className="space-y-3">
              {result.notes.map((n, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-white/80 text-sm">
                  <Star className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--neon-cyan)' }} />
                  {lang === 'ar' ? n.ar : n.en}
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/70">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {t('compatibility.disclaimer')}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
