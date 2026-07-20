-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any previous version of this job so re-running is idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('sync-classroom');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'sync-classroom',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://campmathos.lovable.app/api/public/hooks/sync-classroom',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bHdocHJ6cHJ4cnVpcXF5cWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDc4NDQsImV4cCI6MjA5MjEyMzg0NH0.k4jTQwD09HTJ6ipJXL7aU5JOL2J6Reb-VtmiN9n9BNs'
    ),
    body := '{}'::jsonb
  );
  $$
);
