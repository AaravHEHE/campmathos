# Resources portal for campers

An unlisted Resources area where campers can browse notes, slideshows and games by grade level and week, plus a Resources section in the Camp Director console for adding and managing them.

## What campers see

A new page at `/resources`, reachable only by typing or clicking the direct link — it will not appear in the top menu, the footer, the mobile menu or anywhere else on the site, and search engines are told not to index it. Anyone with the link can open it without signing in.

The page steps through choices:

1. **Elementary** or **Middle School**
2. **Week 1 (Graphing) / Week 2 (Probability) / Week 3 (Geometry) / Week 4 (Final project)** — pulled from the existing camp curriculum so the names always match the rest of the site. Both levels use the same four weeks; only the materials differ.
3. The week's materials, grouped under **Notes**, **Slideshows** and **Blookets/Games**. An empty group still shows its heading with "No resources available yet."

Every item is a card in the site's existing raised 3D style with a preview picture, title, short description and buttons — never a bare link.

- **Notes and slideshows** open a viewer page on the site itself, with the document displayed in the page where possible, plus Download and Open in new tab buttons. PDFs and Google Slides/Drive links display inline; PowerPoint files that can't be shown in a browser fall back to a preview card with download.
- **Games/Blookets** each get their own page on the site (e.g. `/games/probability-blooket`) with the camp's look, the week and topic named, the cover image and description, and a large Play button that opens the game in a new tab. Blooket blocks being displayed inside other sites, so these are branded launch pages rather than broken embeds.

## What Camp Directors can do

A new **Resources** section inside the existing admin console (same sign-in, no changes to how admin login works). From there they can:

- **Add** a resource: title, description, level, week, type, then either upload a file or paste a link (both supported), plus a preview image. The form shows exactly where it will appear, e.g. "Middle School → Week 3 (Geometry) → Slideshows".
- **Edit** everything about a resource, including swapping the file, link or preview image.
- **Delete**, with a confirmation step.
- **Reorder** items within a group by dragging; the camper-facing page respects that order.
- Weeks, levels and the three category names are fixed and can't be renamed or added to.

Files and preview images are stored in the site's own storage, and everything is saved in the site's database — no code editing needed to add a resource, and nothing is shipped as fixed sample content.

## Technical notes

- **Database:** new `resources` table (id, title, description, school_level, week_number, resource_type, file_path, external_url, embed_url, thumbnail_path, slug, position, published, created_at, updated_at) with grants; public `SELECT` for `anon`/`authenticated` limited to published rows, full write access restricted to admins via the existing `has_role(auth.uid(),'admin')` check.
- **Storage:** new public `resource-files` and `resource-thumbnails` buckets; admin-only insert/update/delete policies on `storage.objects`, public read.
- **Curriculum source:** reuse `src/data/weeks.ts` (the data behind the curriculum page) for week numbers and topic names; add a small `SCHOOL_LEVELS` constant beside it. No duplicated week names.
- **Routes:** `src/routes/resources.index.tsx` (stepper, `noindex`), `src/routes/resources.$resourceId.tsx` (document viewer), `src/routes/games.$slug.tsx` (game launch page). Public reads go through a public server function using the publishable-key client; admin writes go through `src/lib/resources.functions.ts` mirroring the existing `admin.functions.ts` pattern (`attachAuthHeader` + `requireSupabaseAuth` + admin assertion).
- **Admin UI:** `src/components/admin/ResourcesManager.tsx` plus a form dialog, mounted as a new section in `src/routes/admin.index.tsx` without altering existing registration/email features. Drag-and-drop ordering via a lightweight HTML5 drag implementation (no new dependency unless needed).
- **Styling:** reuses `card-3d`, `grid-paper`, existing fonts, tokens and `Reveal`/`PageTransition` animations. No navigation, sitemap or footer entries added.
