-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Unified Generation Memory (V2 Table required by Memory Utils)
CREATE TABLE IF NOT EXISTS generation_memory (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt               TEXT NOT NULL,
  business_description TEXT NOT NULL,
  style_keywords       TEXT[] NOT NULL,
  industry             TEXT NOT NULL,
  style                TEXT NOT NULL,
  design_tokens        JSONB NOT NULL,
  layout               JSONB NOT NULL,
  score                NUMERIC NOT NULL,
  screenshot_url       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for generation_memory
ALTER TABLE generation_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generation_memory_public_select" ON generation_memory
  FOR SELECT USING (true);
CREATE POLICY "generation_memory_service_all" ON generation_memory
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Isolated Embedding Tables (1536 dimensions)
CREATE TABLE IF NOT EXISTS generation_embeddings_1536 (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID REFERENCES generation_memory(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL, -- 'openai', 'cohere'
  model_name    TEXT NOT NULL, -- 'text-embedding-3-small'
  embedding     vector(1536) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for embeddings using HNSW
CREATE INDEX IF NOT EXISTS generation_embeddings_1536_hnsw_idx 
  ON generation_embeddings_1536 USING hnsw (embedding vector_cosine_ops);

-- Enable RLS for generation_embeddings_1536
ALTER TABLE generation_embeddings_1536 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generation_embeddings_public_select" ON generation_embeddings_1536
  FOR SELECT USING (true);
CREATE POLICY "generation_embeddings_service_all" ON generation_embeddings_1536
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Component Score
CREATE TABLE IF NOT EXISTS component_score (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL, -- e.g., "HeroV2"
  industry       TEXT NOT NULL,
  style          TEXT NOT NULL,
  page_type      TEXT NOT NULL DEFAULT 'storefront',
  usage_count    INTEGER NOT NULL DEFAULT 0,
  avg_score      NUMERIC NOT NULL DEFAULT 0.0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(component_name, industry, style, page_type)
);

-- Enable RLS for component_score
ALTER TABLE component_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY "component_score_public_select" ON component_score
  FOR SELECT USING (true);
CREATE POLICY "component_score_service_all" ON component_score
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_component_score_updated_at
  BEFORE UPDATE ON component_score
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Generation archive (Sakana BFTS stepping stones + all worker attempts)
CREATE TABLE IF NOT EXISTS generation_archive (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          UUID REFERENCES stores(id) ON DELETE SET NULL,
  business_type     TEXT NOT NULL,
  score             NUMERIC(5,2),
  embedding         vector(1536),
  html_preview      TEXT,
  design_tokens     JSONB,
  models_used       JSONB,
  is_stepping_stone BOOLEAN DEFAULT FALSE,
  worker_id         INTEGER,
  novelty_score     NUMERIC(4,3),
  duration_ms       INTEGER,
  call_count        INTEGER DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for generation_archive
CREATE INDEX IF NOT EXISTS generation_archive_embedding_idx ON generation_archive
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS generation_archive_type_score_idx ON generation_archive (business_type, score DESC);
CREATE INDEX IF NOT EXISTS generation_archive_stepping_type_idx ON generation_archive (is_stepping_stone, business_type);

-- Enable RLS for generation_archive
ALTER TABLE generation_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "generation_archive_public_select" ON generation_archive
  FOR SELECT USING (true);
CREATE POLICY "generation_archive_service_all" ON generation_archive
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Patch history
CREATE TABLE IF NOT EXISTS patch_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type     TEXT NOT NULL,
  patch_type        TEXT,
  patch_description TEXT,
  score_before      NUMERIC(5,2),
  score_after       NUMERIC(5,2),
  score_delta       NUMERIC(5,2),
  success           BOOLEAN,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patch_history_type_delta_idx ON patch_history (business_type, score_delta DESC);

-- Enable RLS for patch_history
ALTER TABLE patch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patch_history_public_select" ON patch_history
  FOR SELECT USING (true);
CREATE POLICY "patch_history_service_all" ON patch_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Similarity Search RPC Function for V2 Generation Memory
CREATE OR REPLACE FUNCTION match_generation_memory(
  query_embedding vector(1536),
  match_threshold NUMERIC,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  prompt TEXT,
  business_description TEXT,
  style_keywords TEXT[],
  industry TEXT,
  style TEXT,
  design_tokens JSONB,
  layout JSONB,
  score NUMERIC,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ,
  similarity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.id,
    gm.prompt,
    gm.business_description,
    gm.style_keywords,
    gm.industry,
    gm.style,
    gm.design_tokens,
    gm.layout,
    gm.score,
    gm.screenshot_url,
    gm.created_at,
    (1 - (ge.embedding <=> query_embedding))::NUMERIC AS similarity
  FROM generation_memory gm
  JOIN generation_embeddings_1536 ge ON ge.generation_id = gm.id
  WHERE 1 - (ge.embedding <=> query_embedding) > match_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 8. Similarity Search RPC Function for V3 Generation Archive
CREATE OR REPLACE FUNCTION match_archive_entries(
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count     INT,
  filter          JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID, business_type TEXT, score NUMERIC,
  design_tokens JSONB, html_preview TEXT,
  models_used JSONB, call_count INT,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    ga.id, ga.business_type, ga.score,
    ga.design_tokens, ga.html_preview,
    ga.models_used, ga.call_count,
    1 - (ga.embedding <=> query_embedding) AS similarity
  FROM generation_archive ga
  WHERE 1 - (ga.embedding <=> query_embedding) > match_threshold
    AND (filter->>'business_type' IS NULL
         OR ga.business_type = filter->>'business_type')
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 9. Add columns for background job status tracking
ALTER TYPE store_status ADD VALUE IF NOT EXISTS 'generating';

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS generation_score NUMERIC(5,2);

