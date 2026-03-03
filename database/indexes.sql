-- ============================================================
-- AETHER BAGHDAD v2.0 — Performance Indexes
-- ============================================================

-- USERS
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier);

-- DREAM_JOURNAL
CREATE INDEX idx_dreams_user_uuid ON public.dream_journal(user_uuid);
CREATE INDEX idx_dreams_created_at ON public.dream_journal(created_at DESC);
CREATE INDEX idx_dreams_user_date ON public.dream_journal(user_uuid, created_at DESC);
CREATE INDEX idx_dreams_feedback ON public.dream_journal(feedback_score) WHERE feedback_score IS NOT NULL;
CREATE INDEX idx_dreams_emotional_tone ON public.dream_journal(emotional_tone);

-- Semantic similarity search using ivfflat (approximate nearest neighbor)
-- Requires pgvector extension
CREATE INDEX idx_dreams_embedding ON public.dream_journal 
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- GIN index for JSONB symbol search
CREATE INDEX idx_dreams_symbols ON public.dream_journal USING gin(symbols_detected);
CREATE INDEX idx_dreams_transits ON public.dream_journal USING gin(transit_snapshot);

-- ASTRO_CHARTS
CREATE INDEX idx_charts_user_uuid ON public.astro_charts(user_uuid);
CREATE INDEX idx_charts_created_at ON public.astro_charts(created_at DESC);
CREATE INDEX idx_charts_user_type ON public.astro_charts(user_uuid, chart_type);
CREATE INDEX idx_charts_natal ON public.astro_charts USING gin(natal_chart);

-- AI_LEARNING_LOG
CREATE INDEX idx_ai_log_user_uuid ON public.ai_learning_log(user_uuid);
CREATE INDEX idx_ai_log_created_at ON public.ai_learning_log(created_at DESC);
CREATE INDEX idx_ai_log_user_date ON public.ai_learning_log(user_uuid, created_at DESC);
CREATE INDEX idx_ai_log_feedback ON public.ai_learning_log(feedback_score) WHERE feedback_score IS NOT NULL;
CREATE INDEX idx_ai_log_type ON public.ai_learning_log(interaction_type);

-- GLOBAL_TRANSITS_CACHE
CREATE UNIQUE INDEX idx_transits_cache_key ON public.global_transits_cache(cache_key);
CREATE INDEX idx_transits_expires ON public.global_transits_cache(expires_at);
CREATE INDEX idx_transits_updated ON public.global_transits_cache(updated_at DESC);

-- USER_SESSIONS_LOG
CREATE INDEX idx_sessions_user ON public.user_sessions_log(user_uuid);
CREATE INDEX idx_sessions_created ON public.user_sessions_log(created_at DESC);
CREATE INDEX idx_sessions_ip ON public.user_sessions_log(ip_address);

-- ============================================================
-- Composite partial indexes for the AI learning pipeline
-- ============================================================

-- Find users with high-quality feedback for model fine-tuning candidates
CREATE INDEX idx_ai_highquality ON public.ai_learning_log(user_uuid, created_at DESC)
  WHERE feedback_score >= 4;

-- Dreams within last 30 days for active users
CREATE INDEX idx_dreams_recent ON public.dream_journal(user_uuid, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '30 days';
