'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { createBrowserSupabaseClient } from '@/lib/db/supabase-browser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Schema = z.object({
  email: z.string().email('اكتب بريد صحيح'),
  password: z.string().min(6, 'الرمز لا يقل عن 6 أحرف'),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function signInPassword() {
    setBusy(true);
    try {
      Schema.parse({ email, password });
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('تم تسجيل الدخول');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e?.message ?? 'فشل تسجيل الدخول');
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    setBusy(true);
    try {
      Schema.parse({ email, password });
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('تم إنشاء الحساب. تحقّق من بريدك إن طُلب تأكيد.');
    } catch (e: any) {
      toast.error(e?.message ?? 'فشل إنشاء الحساب');
    } finally {
      setBusy(false);
    }
  }

  async function magicLink() {
    setBusy(true);
    try {
      z.string().email().parse(email);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast.success('تم إرسال رابط الدخول إلى بريدك');
    } catch (e: any) {
      toast.error(e?.message ?? 'تعذر إرسال رابط الدخول');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="glass-panel glass-panel-glow p-7 space-y-5">
        <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
        <p className="text-white/60 text-sm">سجّل دخولك لحفظ الخرائط والتوقعات وفتح لوحة التحكم.</p>

        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </div>
        <div className="space-y-2">
          <Label>كلمة المرور</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </div>

        <div className="grid gap-2">
          <Button onClick={signInPassword} disabled={busy}>دخول</Button>
          <Button variant="secondary" onClick={signUp} disabled={busy}>إنشاء حساب</Button>
          <Button variant="ghost" onClick={magicLink} disabled={busy}>دخول برابط (Magic Link)</Button>
        </div>

        <p className="text-xs text-white/45">
          ملاحظة: لأغراض الإرشاد والتأمل وليس للتأكيد المطلق.
        </p>
      </Card>
    </div>
  );
}
