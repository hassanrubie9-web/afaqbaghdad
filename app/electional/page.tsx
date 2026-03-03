'use client';
// app/electional/page.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/components/i18n/LangProvider';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const GOALS = [
  { key: 'travel',   iconAr: '✈️ سفر',            iconEn: '✈️ Travel'             },
  { key: 'signing',  iconAr: '📝 توقيع عقد',       iconEn: '📝 Contract Signing'   },
  { key: 'exam',     iconAr: '🎓 امتحان/مقابلة',   iconEn: '🎓 Exam / Interview'   },
  { key: 'wedding',  iconAr: '💍 زواج',             iconEn: '💍 Wedding'            },
  { key: 'business', iconAr: '💼 عمل/استثمار',      iconEn: '💼 Business / Invest'  },
] as const;

type GoalKey = typeof GOALS[number]['key'];

interface TimeWindow {
  dateStr: string;
  quality: 'excellent' | 'good' | 'avoid';
  reasonAr: string;
  reasonEn: string;
}

const RULES: Record<GoalKey, {
  bestDays: number[];   // days of week (0=Sun,1=Mon…)
  avoidDays: number[];
  phaseBoost: string;   // 'waxing' | 'full' | 'waning' | 'new'
  rulesAr: string[];
  rulesEn: string[];
}> = {
  travel:  {
    bestDays: [3, 4],  // Wed, Thu
    avoidDays: [2],    // Tue
    phaseBoost: 'waxing',
    rulesAr: ['يوم الأربعاء (عطارد) مثالي للسفر','تجنّب الثلاثاء (المريخ) لرحلات طويلة'],
    rulesEn: ['Wednesday (Mercury) is ideal for travel','Avoid Tuesday (Mars) for long journeys'],
  },
  signing: {
    bestDays: [3, 4],
    avoidDays: [1],
    phaseBoost: 'waxing',
    rulesAr: ['الأربعاء لتوقيع العقود تحت بركة عطارد','تجنّب الاثنين لأهمية القمر المتقلب'],
    rulesEn: ['Wednesday contracts benefit from Mercury','Avoid Monday — the Moon is changeable'],
  },
  exam:    {
    bestDays: [3, 6],  // Wed, Sat
    avoidDays: [0],
    phaseBoost: 'waxing',
    rulesAr: ['الأربعاء يُعزّز التركيز والذاكرة','السبت مناسب للأعمال الجادة والمنضبطة'],
    rulesEn: ['Wednesday enhances focus and memory','Saturday suits disciplined serious work'],
  },
  wedding: {
    bestDays: [5, 4],  // Fri, Thu
    avoidDays: [2, 6],
    phaseBoost: 'full',
    rulesAr: ['الجمعة يوم الزهرة — أفضل للزواج','القمر البدر يُشع الحب والاكتمال','تجنّب الثلاثاء والسبت للمناسبات الاجتماعية'],
    rulesEn: ['Friday is Venus day — best for marriage','Full Moon radiates love and completion','Avoid Tuesday and Saturday for social events'],
  },
  business: {
    bestDays: [4, 0], // Thu (Jupiter), Sun
    avoidDays: [2],
    phaseBoost: 'waxing',
    rulesAr: ['الخميس يوم المشتري — بركة التوسع والنمو','الهلال المتصاعد يُعزّز البدايات الجديدة'],
    rulesEn: ['Thursday is Jupiter day — expansion and growth','Waxing Moon amplifies new beginnings'],
  },
};

function approximateMoonPhase(d: Date): 'new' | 'waxing' | 'full' | 'waning' {
  const ref = new Date('2024-01-11').getTime();
  const days = (d.getTime() - ref) / 86400000;
  const phase = ((days % 29.53) + 29.53) % 29.53;
  if (phase < 2) return 'new';
  if (phase < 14) return 'waxing';
  if (phase < 17) return 'full';
  return 'waning';
}

const MONTH_SHORT_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTH_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatDate(d: Date, lang: 'ar' | 'en') {
  const months = lang === 'ar' ? MONTH_SHORT_AR : MONTH_SHORT_EN;
  const days   = lang === 'ar' ? DAY_AR : DAY_EN;
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function suggestWindows(goal: GoalKey, fromDate: Date, lang: 'ar' | 'en'): TimeWindow[] {
  const rules = RULES[goal];
  const windows: TimeWindow[] = [];
  const d = new Date(fromDate);

  for (let i = 0; i < 30 && windows.length < 5; i++) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    const phase = approximateMoonPhase(d);

    const isAvoid = rules.avoidDays.includes(dow);
    const isBest  = rules.bestDays.includes(dow);
    const phaseBoost =
      (rules.phaseBoost === 'waxing' && phase === 'waxing') ||
      (rules.phaseBoost === 'full'   && phase === 'full')   ||
      (rules.phaseBoost === 'waning' && phase === 'waning') ||
      (rules.phaseBoost === 'new'    && phase === 'new');

    if (isAvoid) continue;

    const quality: TimeWindow['quality'] =
      isBest && phaseBoost ? 'excellent' : isBest ? 'good' : 'good';

    const phaseLabels = {
      new:    { ar: '🌑 محاق',     en: '🌑 New Moon'      },
      waxing: { ar: '🌒 هلال',     en: '🌒 Waxing Moon'   },
      full:   { ar: '🌕 بدر',      en: '🌕 Full Moon'     },
      waning: { ar: '🌘 تناقص',    en: '🌘 Waning Moon'   },
    };
    const phaseLabel = phaseLabels[phase][lang];

    windows.push({
      dateStr: formatDate(new Date(d), lang),
      quality,
      reasonAr: `${phaseLabel} ${phaseBoost ? '✓ طاقة قمرية مواتية' : ''} — ${rules.rulesAr[0]}`,
      reasonEn: `${phaseLabel} ${phaseBoost ? '✓ Favorable lunar energy' : ''} — ${rules.rulesEn[0]}`,
    });
  }

  return windows.slice(0, 3);
}

export default function ElectionalPage() {
  const { lang } = useLang();
  const [selectedGoal, setSelectedGoal] = useState<GoalKey | null>(null);
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [windows, setWindows] = useState<TimeWindow[] | null>(null);

  function calculate() {
    if (!selectedGoal) return;
    const d = new Date(fromDate);
    if (isNaN(d.getTime())) return;
    setWindows(suggestWindows(selectedGoal, d, lang));
  }

  const qualityStyle = {
    excellent: { border: 'rgba(0,240,255,0.35)', bg: 'rgba(0,240,255,0.08)', color: 'var(--neon-cyan)', label: lang === 'ar' ? '⭐ ممتاز' : '⭐ Excellent' },
    good:      { border: 'rgba(180,90,255,0.25)', bg: 'rgba(180,90,255,0.06)', color: '#b45bff', label: lang === 'ar' ? '✓ جيد' : '✓ Good' },
    avoid:     { border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.05)', color: '#f87171', label: lang === 'ar' ? '⚠ تجنّب' : '⚠ Avoid' },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <Clock className="h-4 w-4" style={{ color: 'var(--neon-cyan)' }} />
          {lang === 'ar' ? 'فلك الاختيار المناسب' : 'Electional Astrology'}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          {lang === 'ar' ? 'اختيار الوقت المناسب' : 'Choose the Right Time'}
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          {lang === 'ar'
            ? 'اختر هدفك وتاريخاً للبدء، وسنقترح لك 3 نوافذ زمنية مناسبة بناءً على طاقة الكواكب والقمر.'
            : 'Choose your goal and a start date, and we\'ll suggest 3 auspicious time windows based on planetary and lunar energy.'}
        </p>
      </motion.div>

      {/* Goal selector */}
      <Card className="glass-panel p-6 space-y-4">
        <h2 className="font-semibold text-white">
          {lang === 'ar' ? 'ما هدفك؟' : 'What is your goal?'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GOALS.map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGoal(g.key)}
              className="rounded-2xl border px-3 py-3 text-sm transition-all text-center"
              style={{
                borderColor: selectedGoal === g.key ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
                background:  selectedGoal === g.key ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)',
                color:       selectedGoal === g.key ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.75)',
              }}
            >
              {lang === 'ar' ? g.iconAr : g.iconEn}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 max-w-xs">
          <label className="text-xs text-white/60">
            {lang === 'ar' ? 'من تاريخ' : 'Starting from'}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[var(--neon-cyan)] focus:outline-none"
          />
        </div>

        <Button
          onClick={calculate}
          disabled={!selectedGoal}
          className="rounded-2xl font-semibold"
          style={{ background: 'linear-gradient(135deg,var(--neon-cyan),var(--neon-purple))', color: '#000' }}
        >
          {lang === 'ar' ? 'اقترح أوقاتاً' : 'Suggest Times'}
        </Button>
      </Card>

      {/* Rules display */}
      {selectedGoal && (
        <Card className="glass-panel p-5">
          <h3 className="font-semibold text-white/80 mb-3 text-sm">
            {lang === 'ar' ? 'قواعد الاختيار' : 'Selection Rules'}
          </h3>
          <ul className="space-y-1">
            {(lang === 'ar' ? RULES[selectedGoal].rulesAr : RULES[selectedGoal].rulesEn).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--neon-cyan)' }} />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Results */}
      <AnimatePresence>
        {windows && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-white text-center">
              {lang === 'ar' ? 'الأوقات المقترحة' : 'Suggested Windows'}
            </h2>
            {windows.map((w, i) => {
              const s = qualityStyle[w.quality];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card
                    className="p-5 space-y-2"
                    style={{ border: `1px solid ${s.border}`, background: s.bg }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-lg">{w.dateStr}</h3>
                      <span className="text-sm font-semibold" style={{ color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">
                      {lang === 'ar' ? w.reasonAr : w.reasonEn}
                    </p>
                  </Card>
                </motion.div>
              );
            })}

            <div className="flex gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/70">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {lang === 'ar'
                ? 'هذه اقتراحات احتمالية للإرشاد والتأمل وليست ضماناً للنتائج. استشر منجّماً متخصصاً للقرارات المهمة.'
                : 'These are probabilistic suggestions for guidance only — not guarantees. Consult a professional astrologer for major decisions.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
