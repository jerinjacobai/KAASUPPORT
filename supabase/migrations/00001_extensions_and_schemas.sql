-- File 1: supabase/migrations/00001_extensions_and_schemas.sql

CREATE SCHEMA IF NOT EXISTS kaa;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Helper functions
CREATE OR REPLACE FUNCTION kaa.current_user_id() 
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION kaa.current_user_company_ids() 
RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY SELECT company_id FROM public.user_company_access WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
