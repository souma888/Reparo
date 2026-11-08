CREATE TABLE IF NOT EXISTS public.reparo_ai_budget (
 bucket text NOT NULL,
 window_start timestamptz NOT NULL,
 attempts integer NOT NULL CHECK (attempts > 0),
 PRIMARY KEY (bucket, window_start)
);
ALTER TABLE public.reparo_ai_budget ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reparo_ai_budget FROM PUBLIC;
