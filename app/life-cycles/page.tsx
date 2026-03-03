'use client';
// app/life-cycles/page.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/i18n/LangProvider';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Cycle {
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  periodYears: number;
  descAr: string;
  descEn: string;
  adviceAr: string;
  adviceEn: string;
}

const CYCLES: Cycle[] = [
  {
    nameAr: 'عودة زحل',
    nameEn: 'Saturn Return',
    icon: '♄',
    color: '#b39ddb',
    periodYears: 29.5,
    descAr: 'زحل يُكمل دورته كل ~29.5 سنة. هذه اللحظات هي نقاط تحوّل حقيقية — يُختبر فيها الالتزام والمسؤولية.',
    descEn: 'Saturn completes its cycle every ~29.5 years. These are real turning points — commitment and responsibility are tested.',
    adviceAr: 'وقت للتقييم الجادّ والبناء على أسس صلبة. تخلَّ عمّا لا يخدمك واستثمر في ما يدوم.',
    adviceEn: 'Time for serious evaluation and building on solid foundations. Release what no longer serves you.',
  },
  {
    nameAr: 'عودة المشتري',
    nameEn: 'Jupiter Return',
    icon: '♃',
    color: '#fbbf24',
    periodYears: 11.86,
    descAr: 'المشتري يعود كل ~12 سنة حاملاً طاقة التوسع والحكمة والفرص. هذه السنة كثيفة بالمكاسب إن أحسنت استخدامها.',
    descEn: 'Jupiter returns every ~12 years with expansion, wisdom, and opportunity. This year is rich with gains if well used.',
    adviceAr: 'توسّع في أفكارك وتجاربك. التعليم والسفر والفلسفة موضوعات حيّة. كن كريماً مع نفسك ومع غيرك.',
    adviceEn: 'Expand your ideas and experiences. Education, travel, and philosophy are alive. Be generous with yourself and others.',
  },
  {
    nameAr: 'عودة العقدة القمرية',
    nameEn: 'Nodal Return',
    icon: '☊',
    color: '#34d399',
    periodYears: 18.6,
    descAr: 'عقدة القمر تُكمل دورتها كل ~18.6 سنة. هذه العودة تربط الماضي بالمستقبل وتُحرّك ما هو مكتوب في رصيدك الكارمي.',
    descEn: 'The lunar nodes complete their cycle every ~18.6 years. This return links past and future, activating karmic patterns.',
    adviceAr: 'استمع إلى النداءات الروحية والعلاقات الكارمية. التحولات في هذه الفترة ذات معنى عميق.',
    adviceEn: 'Listen to spiritual callings and karmic relationships. Shifts during this period carry deep meaning.',
  },
];

function computeReturnDates(birthYear: number, cycle: Cycle): number[] {
  const dates: number[] = [];
  let next = birthYear + cycle.periodYears;
  while (next <= birthYear + 100) {
    dates.push(Math.round(next * 10) / 10);
    next += cycle.periodYears;
  }
  return dates;
}

function yearToDateStr(yearFloat: number, lang: 'ar' | 'en') {
  const y = Math.floor(yearFloat);
  const fraction = yearFloat - y;
  const monthIdx = Math.round(fraction * 12);
  const months_ar = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const months_en = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = lang === 'ar' ? months_ar[Math.min(monthIdx, 11)] : months_en[Math.min(monthIdx, 11)];
  return `${m} ${y}`;
}

export default function LifeCyclesPage() {
  const { lang } = useLang();
  const [birthDate, setBirthDate] = useState('');
  const [cycles, setCycles] = useState<
    Array<{ cycle: Cycle; dates: number[]; upcoming: number | null }>
  >([]);

  function calculate() {
    if (!birthDate) return;
    const d = new Date(birthDate);
    if (isNaN(d.getTime())) return;
    const birthYear = d.getFullYear() + d.getMonth() / 12;
    const now = new Date().getFullYear() + new Date().getMonth() / 12;

    setCycles(
      CYCLES.map((c) => {
        const dates = computeReturnDates(birthYear, c);
        const upcoming = dates.find((yr) => yr > now) ?? null;
        return { cycle: c, dates, upcoming };
      })
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-24 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <RefreshCw className="h-4 w-4" style={{ color: 'var(--neon-cyan)' }} />
          {lang === 'ar' ? 'جدول التحولات الكوكبية' : 'Planetary Cycle Timeline'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {lang === 'ar' ? 'دورات الحياة' : 'Life Cycles'}
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          {lang === 'ar'
            ? 'اكتشف متى تحدث عوداتك الكوكبية الكبرى — لحظات التحوّل والنمو في مسيرتك.'
            : 'Discover when your major planetary returns occur — moments of transformation and growth in your journey.'}
        </p>
      </motion.div>

      <Card className="glass-panel p-6 max-w-sm mx-auto space-y-4">
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
        <Button
          onClick={calculate}
          disabled={!birthDate}
          className="w-full rounded-2xl font-semibold"
          style={{ background: 'linear-gradient(135deg,var(--neon-cyan),var(--neon-purple))', color: '#000' }}
        >
          {lang === 'ar' ? 'احسب الدورات' : 'Calculate Cycles'}
        </Button>
      </Card>

      {cycles.length > 0 && (
        <div className="space-y-6">
          {cycles.map(({ cycle, dates, upcoming }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Card className="glass-panel p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="text-4xl w-12 h-12 flex items-center justify-center rounded-xl border"
                    style={{ borderColor: cycle.color + '44', background: cycle.color + '18' }}
                  >
                    {cycle.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">
                      {lang === 'ar' ? cycle.nameAr : cycle.nameEn}
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                      {lang === 'ar' ? cycle.descAr : cycle.descEn}
                    </p>
                  </div>
                </div>

                {upcoming && (
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{ background: cycle.color + '12', border: `1px solid ${cycle.color}33` }}
                  >
                    <span className="text-white/60">
                      {lang === 'ar' ? 'العودة القادمة: ' : 'Next return: '}
                    </span>
                    <span className="font-semibold" style={{ color: cycle.color }}>
                      {yearToDateStr(upcoming, lang)}
                    </span>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  <div className="font-medium text-white/60 mb-2 text-xs">
                    {lang === 'ar' ? 'الإرشاد' : 'Guidance'}
                  </div>
                  {lang === 'ar' ? cycle.adviceAr : cycle.adviceEn}
                </div>

                {/* Mini timeline */}
                <div>
                  <div className="text-xs text-white/40 mb-2">
                    {lang === 'ar' ? 'مواعيد العوادات' : 'Return Dates'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dates.slice(0, 8).map((yr) => {
                      const now = new Date().getFullYear();
                      const isPast = Math.floor(yr) < now;
                      const isNow = Math.abs(Math.floor(yr) - now) <= 1;
                      return (
                        <span
                          key={yr}
                          className="text-xs px-2 py-1 rounded-lg border"
                          style={{
                            borderColor: isNow ? cycle.color : 'rgba(255,255,255,0.08)',
                            color: isNow ? cycle.color : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)',
                            background: isNow ? cycle.color + '18' : 'transparent',
                          }}
                        >
                          {yearToDateStr(yr, lang)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          <div className="flex gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/70">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {lang === 'ar'
              ? 'التواريخ تقريبية (±6 أشهر). الحساب الدقيق يتطلب خريطة ميلاد كاملة.'
              : 'Dates are approximate (±6 months). Exact calculation requires a full birth chart.'}
          </div>
        </div>
      )}
    </div>
  );
}
