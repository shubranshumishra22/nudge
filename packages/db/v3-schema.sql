-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Generation archive (stepping stones + all attempts)
CREATE TABLE IF NOT EXISTS generation_archive (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID REFERENCES stores(id) ON DELETE SET NULL,
  business_type   TEXT NOT NULL,
  score           NUMERIC(5,2),
  embedding       vector(1536),
  html_preview    TEXT,
  design_tokens   JSONB,
  models_used     JSONB,
  is_stepping_stone BOOLEAN DEFAULT FALSE,
  worker_id       INTEGER,
  novelty_score   NUMERIC(4,3),
  duration_ms     INTEGER,
  call_count      INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generation_archive_embedding_idx ON generation_archive
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS generation_archive_type_score_idx ON generation_archive (business_type, score DESC);
CREATE INDEX IF NOT EXISTS generation_archive_stepping_type_idx ON generation_archive (is_stepping_stone, business_type);

-- Patch history
CREATE TABLE IF NOT EXISTS patch_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type   TEXT NOT NULL,
  patch_type      TEXT,
  patch_description TEXT,
  score_before    NUMERIC(5,2),
  score_after     NUMERIC(5,2),
  score_delta     NUMERIC(5,2),
  success         BOOLEAN,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patch_history_type_delta_idx ON patch_history (business_type, score_delta DESC);

-- RAG similarity RPC
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

-- RLS
ALTER TABLE generation_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE patch_history ENABLE ROW LEVEL SECURITY;
-- Service role has full access, anon has none
