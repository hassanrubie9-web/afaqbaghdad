'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ZodiacTradition } from '@/types/global';
import { TRADITIONS } from '@/lib/astro/traditions';

const Schema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/),
  city: z.string().min(2),
  country: z.string().min(2),
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

export default function ForecastForm() {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string>('');

  const defaults = useMemo<FormValues>(() => ({
    period: 'weekly',
    birth_date: '',
    birth_time: '',
    city: 'Baghdad',
    country: 'Iraq',
    tradition: 'western_tropical',
  }), []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: defaults,
  });

  const period = watch('period');
  const tradition = watch('tradition');

  async function onSubmit(v: FormValues) {
    setBusy(true);
    setOut('');
    try {
      const geoRes = await fetch('/api/geo/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: v.city, country: v.country }),
      });
      const geoText = await geoRes.text();
      const geo = geoText ? safeJson(geoText) : {};
      if (!geoRes.ok) throw new Error(geo?.message ?? 'تعذر تحديد الموقع/المنطقة الزمنية');

      const res = await fetch('/api/forecast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: v.period,
          birth_date: v.birth_date,
          birth_time: v.birth_time,
          birth_timezone: geo.timezone,
          lat: geo.lat,
          lng: geo.lng,
          tradition: v.tradition,
        }),
      });
      const text = await res.text();
      const data = text ? safeJson(text) : {};
      if (!res.ok) throw new Error(data?.message ?? 'فشل توليد التوقعات');

      setOut(String(data?.forecast_text ?? data?.text ?? ''));
      toast.success('تم توليد التوقعات');
    } catch (e: any) {
      toast.error(e?.message ?? 'حدث خطأ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="glass-panel glass-panel-glow p-6">
      <div className="space-y-2 mb-4">
        <h2 className="text-xl font-semibold text-white">التوقعات والإرشاد</h2>
        <p className="text-white/60 text-sm">
          نعرض سيناريوهات احتمالية ونصائح عملية، بعيداً عن الجزم أو التخويف.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>الفترة</Label>
            <Select value={period} onValueChange={(x) => setValue('period', x as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>المدينة</Label>
            <Input placeholder="Baghdad" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label>الدولة</Label>
            <Input placeholder="Iraq" {...register('country')} />
          </div>
          <div className="space-y-2">
            <Label>التقليد/المدرسة</Label>
            <Select value={tradition as any} onValueChange={(x) => setValue('tradition', x as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRADITIONS.map((t) => <SelectItem key={t.key} value={t.key}>{t.name_ar}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-white/50">لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.</p>
          <Button type="submit" disabled={busy}>{busy ? 'جارٍ التوليد...' : 'توليد التوقعات'}</Button>
        </div>
      </form>

      {out ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/85 leading-7 whitespace-pre-wrap">
          {out}
          <div className="mt-4 text-xs text-white/50">لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.</div>
        </div>
      ) : null}
    </Card>
  );
}
