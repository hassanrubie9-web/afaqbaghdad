'use client';
// app/solar-return/page.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/i18n/LangProvider';
import { Sun, AlertCircle, Sparkles } from 'lucide-react';

const THEMES_AR = [
  { icon: '🌱', title: 'البداية والمبادرة', body: 'هذه السنة تحمل طاقة البدايات الجديدة — وقت مثالي لإطلاق مشاريع وأهداف طالما حلمت بها.' },
  { icon: '💞', title: 'العلاقات والشراكات', body: 'تُسلّط الكواكب الضوء على علاقاتك الحميمة والمهنية. التواصل الصادق سيفتح أبواباً.' },
  { icon: '🎯', title: 'المسار المهني', body: 'الطاقة الشمسية هذا العام تُعزّز الطموح. اغتنم الفرص المهنية وابنِ سمعتك بثبات.' },
  { icon: '🔮', title: 'النمو الروحي', body: 'سنة لاستكشاف الباطن والتأمل. اسمح لنفسك بالتوقف والاستماع لصوتك الداخلي.' },
  { icon: '💡', title: 'الإبداع والتعبير', body: 'الفنون والأفكار الجديدة تتدفق بقوة. عبّر عن نفسك بجرأة واستثمر مواهبك الخفية.' },
];

const THEMES_EN = [
  { icon: '🌱', title: 'Beginnings & Initiative', body: 'This year carries the energy of new beginnings — a perfect time to launch projects you\'ve long dreamed of.' },
  { icon: '💞', title: 'Relationships & Partnerships', body: 'The planets highlight your intimate and professional connections. Honest communication will open doors.' },
  { icon: '🎯', title: 'Career Path', body: 'Solar energy amplifies ambition this year. Seize professional opportunities and build your reputation steadily.' },
  { icon: '🔮', title: 'Spiritual Growth', body: 'A year for inner exploration and meditation. Allow yourself to pause and listen to your inner voice.' },
  { icon: '💡', title: 'Creativity & Expression', body: 'New ideas and art flow powerfully. Express yourself boldly and invest in your hidden talents.' },
];

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SolarReturnPage() {
  const { lang } = useLang();
  const [birthDate, setBirthDate] = useState('');
  const [returnYear, setReturnYear] = useState(new Date().getFullYear().toString());
  const [result, setResult] = useState<{
    date: string; age: number; themes: typeof THEMES_AR;
  } | null>(null);

  function calculate() {
    if (!birthDate) return;
    const bd = new Date(birthDate);
    const year = parseInt(returnYear, 10);
    if (isNaN(bd.getTime()) || isNaN(year)) return;

    // Approximate: solar return falls near birthday each year
    const month = bd.getMonth();
    const day   = bd.getDate();
    const returnDate = new Date(year, month, day);
    const age = year - bd.getFullYear();

    // Pick 3 random themes deterministically based on birth month
    const seed = (bd.getMonth() + year) % THEMES_AR.length;
    const themes = (lang === 'ar' ? THEMES_AR : THEMES_EN)
      .slice(seed, seed + 3)
      .concat((lang === 'ar' ? THEMES_AR : THEMES_EN).slice(0, Math.max(0, 3 - (THEMES_AR.length - seed))));

    const months = lang === 'ar' ? MONTHS_AR : MONTHS_EN;
    const dateStr = `${day} ${months[month]} ${year}`;
    setResult({ date: dateStr, age, themes: themes.slice(0, 3) });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <Sun className="h-4 w-4 text-yellow-400" />
          {lang === 'ar' ? 'الخريطة الشمسية السنوية' : 'Annual Solar Chart'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {lang === 'ar' ? 'عودة الشمس' : 'Solar Return'}
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          {lang === 'ar'
            ? 'كل عام حين تعود الشمس لنفس موقعها يوم ميلادك، تبدأ دورة جديدة. اكتشف موضوعات سنتك القادمة.'
            : 'Each year when the Sun returns to its natal position, a new cycle begins. Discover your upcoming year\'s themes.'}
        </p>
      </motion.div>

      <Card className="glass-panel p-8 space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">
              {lang === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[var(--neon-cyan)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">
              {lang === 'ar' ? 'سنة العودة' : 'Return Year'}
            </label>
            <input
              type="number"
              min="1920" max="2100"
              value={returnYear}
              onChange={(e) => setReturnYear(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[var(--neon-cyan)] focus:outline-none"
            />
          </div>
        </div>
        <Button
          onClick={calculate}
          disabled={!birthDate}
          className="w-full rounded-2xl font-semibold"
          style={{ background: 'linear-gradient(135deg,#facc15,#f97316)', color: '#000' }}
        >
          {lang === 'ar' ? 'احسب عودة الشمس' : 'Calculate Solar Return'}
        </Button>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card className="glass-panel p-6 text-center">
            <div className="flex justify-center mb-3">
              <Sun className="h-12 w-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{result.date}</h2>
            <p className="text-white/60 text-sm mt-1">
              {lang === 'ar' ? `السنة ${result.age} من حياتك` : `Year ${result.age} of your life`}
            </p>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {result.themes.map((theme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="glass-panel p-5 h-full space-y-3">
                  <div className="text-3xl">{theme.icon}</div>
                  <h3 className="font-semibold text-white">{theme.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{theme.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/70">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {lang === 'ar'
              ? 'هذه التوقعات للإرشاد والتأمل — الخريطة الكاملة تتطلب بيانات ميلاد دقيقة وحساباً متخصصاً.'
              : 'These insights are for guidance and reflection — a full reading requires precise birth data and specialist calculation.'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
