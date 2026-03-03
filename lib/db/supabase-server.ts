// lib/db/supabase-server.ts
// ============================================================
// AETHER BAGHDAD v2.0 — Supabase Server Client
// Server-only — never import in client components
// ============================================================

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates an authenticated Supabase client for server-side use.
 * Uses the ANON key with cookie-based session (for auth-aware RLS).
 */
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Allow the app to run without Supabase configured (anonymous mode).
    // Routes must guard DB writes behind `if (user)` checks.
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null } as any;
        },
      },
      // If someone tries to use DB methods without configuration, throw clearly.
      from() {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      },
      rpc() {
        throw new Error('Supabase is not configured.');
      },
    } as any;
  }

  const cookieStore = cookies();

  return createSupabaseServerClient(
    url,
    anon,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — can be safely ignored
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase admin client using service role.
 * ONLY for internal server operations that bypass RLS.
 * NEVER expose to client or edge functions.
 */
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
