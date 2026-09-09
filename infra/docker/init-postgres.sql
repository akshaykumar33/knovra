-- Initialize PostgreSQL extensions for Knovra
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify pgvector installed
DO $$
BEGIN
  RAISE NOTICE 'PostgreSQL initialized with uuid-ossp and vector extensions.';
END $$;
