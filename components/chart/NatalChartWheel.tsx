'use client';

import * as React from 'react';
import type { NatalChart, ZodiacTradition } from '@/types/global';
import { signLabelArabic, planetLabelArabic } from '@/lib/astro/traditions';

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function NatalChartWheel({
  chart,
  tradition,
  size = 520,
}: {
  chart: NatalChart;
  tradition: ZodiacTradition;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;

  // دوائر
  const rOuter = size * 0.46;
  const rInner = size * 0.30;
  const rPlanets = size * 0.37;

  // 12 بيوت (Phase 1: توزيع متساوٍ — العرض/الطباعة. (الحساب الدقيق داخل chart.houses))
  const segments = Array.from({ length: 12 }, (_, i) => i);

  const houseCusps = chart.houses?.length === 12 ? chart.houses : segments.map((i) => ({ number: i + 1, sign: 'Aries', degree: i * 30 }));

  // رسم خطوط البيوت
  const houseLines = segments.map((i) => {
    const ang = i * 30;
    const p1 = polar(cx, cy, rInner, ang);
    const p2 = polar(cx, cy, rOuter, ang);
    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
  });

  const ring = (
    <>
      <circle cx={cx} cy={cy} r={rOuter} fill="rgba(255,255,255,0.03)" stroke="rgba(0,240,255,0.22)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={rPlanets} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={rInner} fill="rgba(0,0,0,0.25)" stroke="rgba(180,90,255,0.20)" strokeWidth="2" />
    </>
  );

  // تسميات الأبراج على الحافة
  const signLabels = segments.map((i) => {
    const signEn = houseCusps[i]?.sign ?? 'Aries';
    const { name, glyph } = signLabelArabic(signEn, tradition);
    const a = i * 30 + 15;
    const p = polar(cx, cy, rOuter + size * 0.025, a);
    return (
      <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={Math.round(size * 0.028)} fill="rgba(255,255,255,0.75)">
        {glyph} {name}
      </text>
    );
  });

  // تموضع الكواكب حسب الدرجة داخل البرج (0..360 تقريباً)
  const planets = (chart.planets ?? []).slice(0, 16).map((pl, idx) => {
    const degree = Number(pl.degree ?? 0) + (Number(pl.minute ?? 0) / 60);
    const house = Number(pl.house ?? 1);
    // Phase 1 mapping: house 1 يبدأ من 0°
    const base = (house - 1) * 30;
    const ang = base + degree;
    const jitter = (idx % 4) * (size * 0.008);
    const p = polar(cx, cy, rPlanets - jitter, ang);
    const label = planetLabelArabic(pl.name);
    return (
      <g key={pl.name + idx}>
        <circle cx={p.x} cy={p.y} r={size * 0.014} fill="rgba(0,240,255,0.18)" stroke="rgba(0,240,255,0.55)" strokeWidth="1" />
        <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={Math.round(size * 0.026)} fill="rgba(255,255,255,0.92)">
          {label.glyph}
        </text>
      </g>
    );
  });

  // خطوط الجوانب (Phase 1: نأخذ أهم 12 جانب)
  const aspects = (chart.aspects ?? []).slice(0, 12).map((a, i) => {
    // خريطة سريعة لمواقع الكواكب باستخدام الاسم
    const pA = (chart.planets ?? []).find((p) => p.name === a.planet1);
    const pB = (chart.planets ?? []).find((p) => p.name === a.planet2);
    if (!pA || !pB) return null;

    const angA = ((Number(pA.house ?? 1) - 1) * 30) + Number(pA.degree ?? 0);
    const angB = ((Number(pB.house ?? 1) - 1) * 30) + Number(pB.degree ?? 0);
    const pa = polar(cx, cy, rInner, angA);
    const pb = polar(cx, cy, rInner, angB);

    const orb = Number(a.orb ?? 5);
    const alpha = 0.10 + (1 - clamp01(orb / 6)) * 0.22;

    return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={`rgba(180,90,255,${alpha.toFixed(3)})`} strokeWidth="1" />;
  });

  return (
    <div className="w-full flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_30px_rgba(0,240,255,0.12)]">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(0,240,255,0.16)" />
            <stop offset="65%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={size} height={size} fill="url(#glow)" opacity="0.9" />
        {ring}
        {houseLines}
        {aspects}
        {signLabels}
        {planets}
      </svg>
    </div>
  );
}
