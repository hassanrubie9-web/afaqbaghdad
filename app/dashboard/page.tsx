import Link from 'next/link';
import { createServerClient } from '@/lib/db/supabase-server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // إذا Supabase غير مُهيأ
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabase) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card className="glass-panel p-6 space-y-3">
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-white/70">
            قاعدة البيانات غير مهيّأة بعد. يمكنك تشغيل الواجهة محلياً، ثم إضافة مفاتيح Supabase لاحقاً على Netlify.
          </p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card className="glass-panel glass-panel-glow p-6 space-y-4">
          <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="text-white/70">سجّل الدخول لمشاهدة محفوظات الخرائط والتوقعات.</p>
          <div>
            <Link href="/login">
              <Button>تسجيل الدخول</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // جلب آخر الخرائط والتوقعات
  const { data: charts } = await supabase
    .from('natal_charts')
    .select('id, tradition, house_system, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: forecasts } = await supabase
    .from('forecasts')
    .select('id, period, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-white/60">أرشيفك الشخصي — خرائط الميلاد والتوقعات.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">خرائط الميلاد</h2>
            <Link href="/chart"><Button variant="secondary">خريطة جديدة</Button></Link>
          </div>
          <div className="space-y-2">
            {(charts ?? []).length === 0 ? (
              <p className="text-white/60 text-sm">لا توجد خرائط محفوظة بعد.</p>
            ) : (
              (charts ?? []).map((c: any) => (
                <Link key={c.id} href={`/chart/result?id=${encodeURIComponent(c.id)}`}>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 transition">
                    <div className="text-white/90 font-medium">خريطة ميلاد</div>
                    <div className="text-white/60 text-xs">
                      {String(c.tradition ?? '')} • {String(c.house_system ?? '')} • {new Date(c.created_at).toLocaleString('ar-IQ')}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">التوقعات</h2>
            <Link href="/forecast"><Button variant="secondary">توليد جديد</Button></Link>
          </div>
          <div className="space-y-2">
            {(forecasts ?? []).length === 0 ? (
              <p className="text-white/60 text-sm">لا توجد توقعات محفوظة بعد.</p>
            ) : (
              (forecasts ?? []).map((f: any) => (
                <div key={f.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <div className="text-white/90 font-medium">توقع {f.period === 'daily' ? 'يومي' : f.period === 'weekly' ? 'أسبوعي' : 'شهري'}</div>
                  <div className="text-white/60 text-xs">{new Date(f.created_at).toLocaleString('ar-IQ')}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
