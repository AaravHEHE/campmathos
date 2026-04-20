-- Phase 4: schedule daily digest email at 8am Chicago time (~13:00 UTC).
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Store the function URL + anon key in vault for the cron job.
-- Re-create on every migration so changes take effect.
do $$
declare
  v_url text := 'https://lzlwhprzprxruiqqyqbw.supabase.co/functions/v1/daily-digest';
  v_anon text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bHdocHJ6cHJ4cnVpcXF5cWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDc4NDQsImV4cCI6MjA5MjEyMzg0NH0.k4jTQwD09HTJ6ipJXL7aU5JOL2J6Reb-VtmiN9n9BNs';
begin
  -- Upsert vault secrets idempotently.
  if exists (select 1 from vault.secrets where name = 'daily_digest_url') then
    perform vault.update_secret(
      (select id from vault.secrets where name = 'daily_digest_url'),
      v_url
    );
  else
    perform vault.create_secret(v_url, 'daily_digest_url');
  end if;

  if exists (select 1 from vault.secrets where name = 'daily_digest_anon_key') then
    perform vault.update_secret(
      (select id from vault.secrets where name = 'daily_digest_anon_key'),
      v_anon
    );
  else
    perform vault.create_secret(v_anon, 'daily_digest_anon_key');
  end if;
end $$;

-- Unschedule any prior version of this job, then schedule fresh.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'daily-digest-mathos') then
    perform cron.unschedule('daily-digest-mathos');
  end if;
end $$;

select cron.schedule(
  'daily-digest-mathos',
  '0 13 * * *', -- 13:00 UTC = 8am CDT / 7am CST
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'daily_digest_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'daily_digest_anon_key')
    ),
    body := jsonb_build_object('source', 'pg_cron')
  ) as request_id;
  $$
);