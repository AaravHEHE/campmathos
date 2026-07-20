CREATE TABLE public.google_oauth_tokens (
  id text PRIMARY KEY,
  refresh_token text NOT NULL,
  google_email text,
  scope text,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.google_oauth_tokens TO service_role;
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only service_role (server code) reads/writes.
CREATE TRIGGER trg_google_oauth_tokens_updated_at
  BEFORE UPDATE ON public.google_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
