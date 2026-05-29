# Update camp schedule: 2-hour sessions, 3–5 PM, July only

## Changes

### `src/lib/camp.ts` (source of truth)
- `sessionStartTime`: `"13:00"` → `"15:00"`
- `sessionEndTime`: `"16:00"` → `"17:00"`
- `endDateISO`: `"2026-08-13"` → `"2026-07-30"` (last Thursday of July)
- `humanDateRange`: `"July – August 2026"` → `"July 2026"`
- `humanTime`: `"Early afternoon Central (3 hr)"` → `"3–5 PM Central (2 hr)"`

### `src/components/ShareButtons.tsx`
- Update `SHARE_TEXT`: "Tue/Thu, July 7 – August 13, 2026" → "Tue/Thu, July 7 – 30, 2026"

### `src/lib/seo.ts`
- Description: drop "multi-week" framing if it now reads oddly (keep as-is otherwise — still multi-week within July)

### `src/routes/details.tsx`
- Meta description: "early afternoon Central time from July 7 through August 13, 2026. 3-hour sessions with a short break" → "from 3–5 PM Central, July 7 through July 30, 2026. 2-hour sessions"
- Facts list: "Session length" → `"2 hours"` (no break needed at 2 hrs — remove "with a short break")
- Hero/sub copy: "three hours in the early afternoon" → "two hours in the late afternoon"
- Three-card session structure: rework from First 80 min / 20 min break / Final 80 min to a 2-hour shape — e.g. First ~55 min (concept + activity) / ~10 min break / Final ~55 min (project + Q&A). Or drop the break card entirely and use two cards. **Decision below.**
- "Add to calendar" copy: "July 7 through August 13, 2026" → "July 7 through July 30, 2026"

### Other route files (sweep)
Search for and update any remaining mentions of:
- "August" / "August 13" / "July – August"
- "3 hour" / "three hours" / "1–4" / "1:00 PM" / "early afternoon"
in `src/routes/index.tsx`, `about.tsx`, `faq.tsx`, `curriculum.tsx`, `register.tsx`, and `supabase/functions/send-registration-email/index.ts`.

### Memory
Update `mem://index.md` Core line to reflect 2-hour sessions, 3–5 PM, July 7–30, 2026.

## Auto-derived (no code changes needed)
- `.ics` calendar regenerates from `CAMP` constants → correct sessions, times, end date automatically.
- JSON-LD schema regenerates from `CAMP` constants automatically.

## One open question
The Details page currently shows a 3-card "First half / Break / Second half" layout built around a 3-hour session. At 2 hours a mid-session break is tighter. Options:

1. **Keep 3 cards**, shrink to ~55 / 10 / ~55 min.
2. **Drop the break card**, show 2 cards (First hour: concept + activity / Second hour: project + Q&A).

I'll go with option 1 (keep the break, just shorter) unless you prefer option 2.
