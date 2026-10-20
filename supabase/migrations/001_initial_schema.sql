-- PolyCode Hub v0.2.0 Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Props',
  author_name TEXT NOT NULL DEFAULT 'anonymous',
  version TEXT NOT NULL DEFAULT '1.0.0',
  code TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  forked_from UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proposed_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pull_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public insert assets" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update assets" ON public.assets FOR UPDATE USING (true);

CREATE POLICY "Public read PRs" ON public.pull_requests FOR SELECT USING (true);
CREATE POLICY "Public insert PRs" ON public.pull_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update PRs" ON public.pull_requests FOR UPDATE USING (true);
