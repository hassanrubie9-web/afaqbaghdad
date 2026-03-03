import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase (browser).
 * يعتمد على NEXT_PUBLIC_* فقط.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Supabase غير مُهيّأ. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createBrowserClient(url, anon);
}
