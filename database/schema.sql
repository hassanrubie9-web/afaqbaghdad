-- ============================================================
-- AETHER BAGHDAD v2.0 — PostgreSQL Schema
-- Author: Chief System Architect
-- Engine: Supabase (PostgreSQL 15+)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for semantic embeddings

-- ============================================================
-- TABLE: users
-- Core identity and astrological birth data
-- ============================================================
CREATE TABLE public.users (
  uuid          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  birth_data    JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- birth_data schema: { date: "YYYY-MM-DD", time: "HH:MM", timezone: "..." }
  coordinates   JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- coordinates schema: { lat: float, lng: float, city: "...", country: "..." }
  learning_profile JSONB NOT NULL DEFAULT '{
    "dominant_themes": [],
    "emotional_tone_history": [],
    "avg_feedback_score": 0,
    "interpretation_count": 0,
    "preferred_symbolism": [],
    "last_updated": null
  }'::jsonb,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'scholar', 'sage')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: dream_journal
-- AI-interpreted dream entries with semantic embeddings
-- ============================================================
CREATE TABLE public.dream_journal (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uuid           UUID NOT NULL REFERENCES public.users(uuid) ON DELETE CASCADE,
  dream_text          TEXT NOT NULL,
  ai_interpretation   TEXT,
  emotional_tone      TEXT,   -- 'transformative', 'fearful', 'transcendent', etc.
  symbols_detected    JSONB DEFAULT '[]'::jsonb,
  lunar_phase_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- { phase: "...", illumination: float, age_days: float }
  transit_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- { planets: [...], significant_aspects: [...] }
  embedding_vector    vector(1536),  -- OpenAI/Groq text embedding for similarity
  feedback_score      SMALLINT CHECK (feedback_score BETWEEN 1 AND 5),
  is_private          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: astro_charts
-- Natal and progressed chart storage
-- ============================================================
CREATE TABLE public.astro_charts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uuid     UUID NOT NULL REFERENCES public.users(uuid) ON DELETE CASCADE,
  chart_type    TEXT NOT NULL DEFAULT 'natal' CHECK (chart_type IN ('natal', 'solar_return', 'synastry', 'transit')),
  natal_chart   JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Full planetary positions, aspects, house cusps
  house_system  TEXT NOT NULL DEFAULT 'placidus',
  zodiac_type   TEXT NOT NULL DEFAULT 'tropical' CHECK (zodiac_type IN ('tropical', 'sidereal')),
  orb_settings  JSONB DEFAULT '{}'::jsonb,
  raw_api_response JSONB,   -- Cache raw API response for re-rendering
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: ai_learning_log
-- Every AI interaction for the self-improving loop
-- ============================================================
CREATE TABLE public.ai_learning_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uuid       UUID NOT NULL REFERENCES public.users(uuid) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'dream' CHECK (interaction_type IN ('dream', 'chart', 'transit', 'query')),
  input_prompt    TEXT NOT NULL,
  output_response TEXT NOT NULL,
  model_used      TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  tokens_used     INTEGER,
  feedback_score  SMALLINT CHECK (feedback_score BETWEEN 1 AND 5),
  emotional_context JSONB DEFAULT '{}'::jsonb,
  -- { detected_tone: "...", symbols: [...], lunar_phase: "..." }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: global_transits_cache
-- Planetary position cache — refreshed every 4 hours
-- ============================================================
CREATE TABLE public.global_transits_cache (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key        TEXT UNIQUE NOT NULL, -- e.g. "transits:2025-01-15:00"
  planet_positions JSONB NOT NULL DEFAULT '{}'::jsonb,
  lunar_data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  significant_events JSONB DEFAULT '[]'::jsonb,
  expires_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: user_sessions_log (security audit)
-- ============================================================
CREATE TABLE public.user_sessions_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uuid  UUID REFERENCES public.users(uuid) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  action     TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
