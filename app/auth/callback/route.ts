import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';

/**
 * Supabase Magic Link / OAuth callback.
 * يتوقع وجود ?code=...
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const supabase = await createServerClient();
    // @ts-ignore
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth', req.url));
  }
}
