-- ============================================================
-- AETHER BAGHDAD v2.0 — Row Level Security Policies
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astro_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions_log ENABLE ROW LEVEL SECURITY;

-- global_transits_cache is read-only public (no user data)
ALTER TABLE public.global_transits_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS table policies
-- ============================================================
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = uuid);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = uuid)
  WITH CHECK (auth.uid() = uuid);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = uuid);

-- ============================================================
-- DREAM_JOURNAL table policies
-- ============================================================
CREATE POLICY "dreams_select_own" ON public.dream_journal
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "dreams_insert_own" ON public.dream_journal
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "dreams_update_own" ON public.dream_journal
  FOR UPDATE USING (auth.uid() = user_uuid)
  WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "dreams_delete_own" ON public.dream_journal
  FOR DELETE USING (auth.uid() = user_uuid);

-- ============================================================
-- ASTRO_CHARTS table policies
-- ============================================================
CREATE POLICY "charts_select_own" ON public.astro_charts
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "charts_insert_own" ON public.astro_charts
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "charts_update_own" ON public.astro_charts
  FOR UPDATE USING (auth.uid() = user_uuid);

CREATE POLICY "charts_delete_own" ON public.astro_charts
  FOR DELETE USING (auth.uid() = user_uuid);

-- ============================================================
-- AI_LEARNING_LOG table policies
-- ============================================================
CREATE POLICY "ai_log_select_own" ON public.ai_learning_log
  FOR SELECT USING (auth.uid() = user_uuid);

CREATE POLICY "ai_log_insert_own" ON public.ai_learning_log
  FOR INSERT WITH CHECK (auth.uid() = user_uuid);

CREATE POLICY "ai_log_update_own" ON public.ai_learning_log
  FOR UPDATE USING (auth.uid() = user_uuid);

-- ============================================================
-- GLOBAL_TRANSITS_CACHE — all authenticated users can read
-- Only service role (backend) can write
-- ============================================================
CREATE POLICY "transits_read_authenticated" ON public.global_transits_cache
  FOR SELECT TO authenticated USING (true);

-- No INSERT/UPDATE/DELETE for non-service roles (service_role bypasses RLS)

-- ============================================================
-- USER_SESSIONS_LOG — users can only see own logs
-- ============================================================
CREATE POLICY "sessions_select_own" ON public.user_sessions_log
  FOR SELECT USING (auth.uid() = user_uuid);
