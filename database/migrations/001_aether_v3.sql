-- database/migrations/001_aether_v3.sql
-- ============================================================
-- آثير بغداد v3 — جداول + سياسات RLS (Supabase)
-- ============================================================

-- 1) ملف المستخدم
create table if not exists public.users_profile (
  user_uuid uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birth_data jsonb,
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) خرائط الميلاد
create table if not exists public.natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references auth.users(id) on delete cascade,
  chart_json jsonb not null,
  tradition text not null default 'western_tropical',
  house_system text not null default 'placidus',
  created_at timestamptz not null default now()
);

-- 3) التوقعات
create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  user_uuid uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('daily','weekly','monthly')),
  input_snapshot jsonb,
  forecast_text text not null,
  created_at timestamptz not null default now()
);

-- 4) كاش الترانزيت
create table if not exists public.transits_cache (
  id bigserial primary key,
  positions jsonb not null,
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists natal_charts_user_uuid_idx on public.natal_charts(user_uuid, created_at desc);
create index if not exists forecasts_user_uuid_idx on public.forecasts(user_uuid, created_at desc);
create index if not exists transits_cache_updated_at_idx on public.transits_cache(updated_at desc);

-- RLS
alter table public.users_profile enable row level security;
alter table public.natal_charts enable row level security;
alter table public.forecasts enable row level security;
alter table public.transits_cache enable row level security;

-- users_profile policies
drop policy if exists "users_profile_select_own" on public.users_profile;
create policy "users_profile_select_own"
on public.users_profile for select
using (auth.uid() = user_uuid);

drop policy if exists "users_profile_upsert_own" on public.users_profile;
create policy "users_profile_upsert_own"
on public.users_profile for insert
with check (auth.uid() = user_uuid);

drop policy if exists "users_profile_update_own" on public.users_profile;
create policy "users_profile_update_own"
on public.users_profile for update
using (auth.uid() = user_uuid)
with check (auth.uid() = user_uuid);

-- natal_charts policies
drop policy if exists "natal_charts_select_own" on public.natal_charts;
create policy "natal_charts_select_own"
on public.natal_charts for select
using (auth.uid() = user_uuid);

drop policy if exists "natal_charts_insert_own" on public.natal_charts;
create policy "natal_charts_insert_own"
on public.natal_charts for insert
with check (auth.uid() = user_uuid);

drop policy if exists "natal_charts_delete_own" on public.natal_charts;
create policy "natal_charts_delete_own"
on public.natal_charts for delete
using (auth.uid() = user_uuid);

-- forecasts policies
drop policy if exists "forecasts_select_own" on public.forecasts;
create policy "forecasts_select_own"
on public.forecasts for select
using (auth.uid() = user_uuid);

drop policy if exists "forecasts_insert_own" on public.forecasts;
create policy "forecasts_insert_own"
on public.forecasts for insert
with check (auth.uid() = user_uuid);

drop policy if exists "forecasts_delete_own" on public.forecasts;
create policy "forecasts_delete_own"
on public.forecasts for delete
using (auth.uid() = user_uuid);

-- transits_cache policies:
-- قراءة عامة مسموحة (لتخفيف الضغط على API) - بدون بيانات حساسة
drop policy if exists "transits_cache_select_all" on public.transits_cache;
create policy "transits_cache_select_all"
on public.transits_cache for select
using (true);

-- منع الكتابة إلا عبر Service Role (يتخطى RLS) — لا نضيف سياسات insert/update هنا

