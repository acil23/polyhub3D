CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Sci-Fi',
  author_name TEXT NOT NULL DEFAULT 'anonymous',
  version TEXT NOT NULL DEFAULT '1.0.0',
  code TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  forked_from TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  code TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pull_requests (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  asset_title TEXT,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proposed_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'merged', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pull_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read assets" ON public.assets;
CREATE POLICY "Public read assets" ON public.assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert assets" ON public.assets;
CREATE POLICY "Public insert assets" ON public.assets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update assets" ON public.assets;
CREATE POLICY "Public update assets" ON public.assets FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete assets" ON public.assets;
CREATE POLICY "Public delete assets" ON public.assets FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public read versions" ON public.asset_versions;
CREATE POLICY "Public read versions" ON public.asset_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert versions" ON public.asset_versions;
CREATE POLICY "Public insert versions" ON public.asset_versions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read PRs" ON public.pull_requests;
CREATE POLICY "Public read PRs" ON public.pull_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert PRs" ON public.pull_requests;
CREATE POLICY "Public insert PRs" ON public.pull_requests FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update PRs" ON public.pull_requests;
CREATE POLICY "Public update PRs" ON public.pull_requests FOR UPDATE USING (true);
