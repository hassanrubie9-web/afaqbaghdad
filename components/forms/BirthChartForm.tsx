'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ZodiacTradition } from '@/types/global';
import { TRADITIONS } from '@/lib/astro/traditions';

const Schema = z.object({
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD'),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, 'صيغة الوقت يجب أن تكون HH:MM'),
  city: z.string().min(2, 'اكتب اسم المدينة'),
  country: z.string().min(2, 'اكتب اسم الدولة'),
  house_system: z.enum(['placidus', 'whole_sign', 'koch']),
  tradition: z.custom<ZodiacTradition>(),
});

type FormValues = z.infer<typeof Schema>;

function safeJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return { message: 'رجع السيرفر استجابة غير JSON', raw: raw.slice(0, 220) };
  }
}

export default function BirthChartForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const defaults = useMemo<FormValues>(() => ({
    birth_date: '',
    birth_time: '',
    city: 'Baghdad',
    country: 'Iraq',
    house_system: 'placidus',
    tradition: 'western_tropical',
  }), []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: defaults,
  });

  const tradition = watch('tradition');
  const houseSystem = watch('house_system');

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      // 1) Resolve location -> lat/lng + timezone
      const geoRes = await fetch('/api/geo/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: values.city, country: values.country }),
      });
      const geoText = await geoRes.text();
      const geo = geoText ? safeJson(geoText) : {};
      if (!geoRes.ok) {
        throw new Error(geo?.message ?? geo?.error ?? 'تعذر تحديد الموقع/المنطقة الزمنية');
      }

      // 2) Calculate chart (new route)
      const calcRes = await fetch('/api/chart/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_date: values.birth_date,
          birth_time: values.birth_time,
          birth_timezone: geo.timezone,
          lat: geo.lat,
          lng: geo.lng,
          house_system: values.house_system,
          tradition: values.tradition,
        }),
      });

      const calcText = await calcRes.text();
      const calc = calcText ? safeJson(calcText) : {};
      if (!calcRes.ok) {
        throw new Error(calc?.message ?? calc?.error ?? 'فشل حساب خريطة الميلاد');
      }

      // store in session for anonymous view
      try {
        sessionStorage.setItem('aether_last_chart', JSON.stringify(calc));
      } catch {}

      toast.success('تم إنشاء خريطة الميلاد بنجاح');
      const id = calc?.chart_id ? `?id=${encodeURIComponent(calc.chart_id)}` : '';
      router.push(`/chart/result${id}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'حدث خطأ غير متوقع');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="glass-panel glass-panel-glow p-6">
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-white">إنشاء خريطة الميلاد</h2>
        <p className="text-white/60 text-sm">
          أدخل بياناتك، وسنحسب البيوت والكواكب والجوانب مع عرض عربي قابل للطباعة.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>تاريخ الميلاد</Label>
            <Input placeholder="1999-12-31" {...register('birth_date')} />
            {errors.birth_date && <p className="text-red-300 text-xs">{errors.birth_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>وقت الميلاد</Label>
            <Input placeholder="13:45" {...register('birth_time')} />
            {errors.birth_time && <p className="text-red-300 text-xs">{errors.birth_time.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>المدينة</Label>
            <Input placeholder="Baghdad" {...register('city')} />
            {errors.city && <p className="text-red-300 text-xs">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>الدولة</Label>
            <Input placeholder="Iraq" {...register('country')} />
            {errors.country && <p className="text-red-300 text-xs">{errors.country.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نظام البيوت</Label>
            <Select value={houseSystem} onValueChange={(v) => setValue('house_system', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر النظام" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placidus">بلاديوس (Placidus)</SelectItem>
                <SelectItem value="whole_sign">البيت الكامل (Whole Sign)</SelectItem>
                <SelectItem value="koch">كوش (Koch)</SelectItem>
              </SelectContent>
            </Select>
            {errors.house_system && <p className="text-red-300 text-xs">{String(errors.house_system.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label>التقليد/المدرسة</Label>
            <Select value={tradition as any} onValueChange={(v) => setValue('tradition', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التقليد" />
              </SelectTrigger>
              <SelectContent>
                {TRADITIONS.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tradition && <p className="text-red-300 text-xs">{String(errors.tradition.message)}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <p className="text-xs text-white/50">
            ملاحظة: النتائج لأغراض الإرشاد والتأمل وليست للتأكيد المطلق.
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? 'جارٍ الحساب...' : 'إنشاء الخريطة'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
