CREATE TABLE IF NOT EXISTS public.reparo_workshops (
 user_id text PRIMARY KEY,
 data jsonb NOT NULL,
 revision integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (octet_length(data::text) <= 2097152)
);
-- Access is through the authenticated server API only. No Data API is enabled.
ALTER TABLE public.reparo_workshops ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reparo_workshops FROM PUBLIC;
