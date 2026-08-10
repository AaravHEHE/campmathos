# Lock down the registration sync endpoint

## The issue

`/api/public/hooks/sync-form-emails` is a fully open endpoint. The `/api/public/` prefix intentionally bypasses site login (so the scheduled job can call it), but this handler never checks who the caller is — both `GET` and `POST` run the sync immediately.

Anyone who knows or guesses the URL can:

- Trigger a pull of your Google Form rows on demand, as often as they like.
- Cause inserts and updates to the `registrations` table (camper names, parent names, emails, phone numbers, grade levels) using the admin database key, which bypasses all access rules.
- Hammer your Google Sheets quota and your database with repeated requests.

It does not currently leak data back to the caller (the response is only counts), but unauthenticated writes to a table holding family PII is a real problem, and the scanner is right to flag it as an error.

## The fix

Require a shared secret on every call, and give the scheduled job that secret.

1. Create a secret named `SYNC_HOOK_SECRET` (a random value generated server-side; nobody needs to see it).
2. In the endpoint, before doing any work, read the caller's `Authorization: Bearer <secret>` header (also accept `x-sync-secret`) and compare it to `SYNC_HOOK_SECRET` using a timing-safe comparison. If it's missing or wrong, return `401` and do nothing.
3. If the secret isn't configured on the server, fail closed with `503` rather than running unauthenticated.
4. Drop the `GET` handler — a scheduled write job should be `POST` only, which also stops casual browser hits and prefetchers from firing it.
5. Update the scheduled sync job (the one that calls this URL every minute) so it sends the same bearer header. Without this step the sync silently stops working.
6. Verify: a call with no header returns 401, and a call with the correct header returns the usual `{ success: true, ... }` counts and the registration list still updates.

## Technical notes

- File: `src/routes/api.public.hooks.sync-form-emails.ts`.
- Read `process.env['SYNC_HOOK_SECRET']` inside the handler, not at module scope.
- Use `crypto.timingSafeEqual` on equal-length buffers (length-check first) so the comparison can't be probed.
- The scheduled job runs through the database's `pg_net` HTTP call; its `headers` JSON needs the `Authorization` entry added. This is done in a migration and requires reading the current job definition first, so the job's schedule and URL are preserved exactly.
- Admin login, the admin dashboard, the emailing tools, and all public pages are untouched.
- After verifying, mark the finding `open_sync_form_emails` as fixed.
