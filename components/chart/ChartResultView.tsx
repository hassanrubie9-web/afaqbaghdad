'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NatalChart, ZodiacTradition } from '@/types/global';
import { NatalChartWheel } from '@/components/chart/NatalChartWheel';
import { chineseZodiacForYear, planetLabelArabic, signLabelArabic, TRADITIONS } from '@/lib/astro/traditions';

type ApiPayload = {
  chart?: NatalChart;
  chart_id?: string;
  tradition?: ZodiacTradition;
  house_system?: string;
  meta?: any;
};

function safeJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return { message: 'رجع السيرفر استجابة غير JSON', raw: raw.slice(0, 220) };
  }
}

export default function ChartResultView() {
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const tradition = (payload?.tradition ?? 'western_tropical') as ZodiacTradition;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // ✅ قراءة id من URL داخل المتصفح (بديل useSearchParams لتجنب مشاكل prerender في Netlify)
        const url = new URL(window.location.href);
        const idFromUrl = url.searchParams.get('id');

        if (idFromUrl) {
          const res = await fetch(`/api/chart/calculate?id=${encodeURIComponent(idFromUrl)}`);
          const text = await res.text();
          const data = text ? safeJson(text) : {};
          if (!res.ok) throw new Error(data?.message ?? 'تعذر تحميل الخريطة المحفوظة');
          setPayload(data);
          return;
        }

        // fallback to sessionStorage
        const raw = sessionStorage.getItem('aether_last_chart');
        if (!raw) throw new Error('لا توجد خريطة حديثة. ارجع لصفحة خريطة الميلاد وأنشئ واحدة.');
        setPayload(JSON.parse(raw));
      } catch (e: any) {
        toast.error(e?.message ?? 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const chart = payload?.chart;

  const chineseInfo = useMemo(() => {
    const birthYear = (payload?.meta?.birth_year as number | undefined);
    if (!birthYear) return null;
    return chineseZodiacForYear(birthYear);
  }, [payload]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="glass-panel p-6">
          <div className="animate-pulse text-white/60">جارٍ تحميل النتيجة…</div>
        </Card>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Card className="glass-panel p-6">
          <p className="text-white/70">لا توجد بيانات لعرضها.</p>
        </Card>
      </div>
    );
  }

  const traditionName = TRADITIONS.find((t) => t.key === tradition)?.name_ar ?? '—';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">نتيجة خريطة الميلاد</h1>
          <p className="text-white/60">
            التقليد: <span className="text-white/80">{traditionName}</span>
            {payload?.house_system ? (
              <>
                {' '}
                • نظام البيوت: <span className="text-white/80">{payload.house_system}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            طباعة
          </Button>
          <Button onClick={() => (window.location.href = '/chart')}>إنشاء خريطة جديدة</Button>
        </div>
      </div>

      <Card className="glass-panel glass-panel-glow p-6">
        <NatalChartWheel chart={chart} tradition={tradition} />
        <p className="text-xs text-white/50 mt-4">لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">الطالع والوتد العاشر</h2>
          <div className="grid grid-cols-2 gap-4 text-white/80">
            <div>
              <div className="text-white/60 text-sm">الطالع</div>
              <div className="font-semibold">
                {signLabelArabic(chart.ascendant?.sign ?? 'Aries', tradition).glyph}{' '}
                {signLabelArabic(chart.ascendant?.sign ?? 'Aries', tradition).name}
                <span className="text-white/60"> — {Number(chart.ascendant?.degree ?? 0).toFixed(1)}°</span>
              </div>
            </div>
            <div>
              <div className="text-white/60 text-sm">MC</div>
              <div className="font-semibold">
                {signLabelArabic(chart.midheaven?.sign ?? 'Capricorn', tradition).glyph}{' '}
                {signLabelArabic(chart.midheaven?.sign ?? 'Capricorn', tradition).name}
                <span className="text-white/60"> — {Number(chart.midheaven?.degree ?? 0).toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {tradition === 'chinese' && chineseInfo ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
              <div className="text-white font-semibold mb-1">إضافة صينية (Phase 1)</div>
              <div className="text-sm">
                حيوان السنة: <span className="text-white">{chineseInfo.animal_ar}</span>
              </div>
              <div className="text-sm">
                العنصر: <span className="text-white">{chineseInfo.element_ar}</span>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">الكواكب</h2>
          <div className="space-y-2">
            {(chart.planets ?? []).slice(0, 12).map((p, idx) => {
              const pl = planetLabelArabic(p.name);
              const sign = signLabelArabic(p.sign, tradition);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="text-white/90 font-medium">
                    {pl.glyph} {pl.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {sign.glyph} {sign.name} • {Number(p.degree ?? 0).toFixed(1)}° • البيت {p.house ?? '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">الجوانب (مختصر)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {(chart.aspects ?? []).slice(0, 12).map((a, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/80">
              <div className="font-medium text-white/90">
                {a.planet1} — {a.aspect} — {a.planet2}
              </div>
              <div className="text-xs text-white/60">هامش (Orb): {Number(a.orb ?? 0).toFixed(1)}°</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
