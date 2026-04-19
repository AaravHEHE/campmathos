
**Goal:** Make the FAQ items on the home page clickable, navigating to `/faq` and auto-opening the corresponding answer.

**Investigation needed:**
- Home page FAQ teaser uses 4 hardcoded questions: "Is the camp really free?", "How do we sign up?", "What days does it meet?", "What should my child bring?"
- FAQ page uses `<details>/<summary>` rows from a `faqs` array

**Approach:**
1. **Add stable IDs to FAQ entries** in `src/routes/faq.tsx` — give each `{q, a}` an `id` slug (e.g., `cost`, `signup`, `days`, `bring`).
2. **Render `<details id={id}>`** so each accordion can be targeted by hash.
3. **On FAQ page mount**, read `window.location.hash`, find the matching `<details>`, set `open=true`, and scroll it into view.
4. **Update home page FAQ teaser** in `src/routes/index.tsx`: convert each `<li>` into a TanStack Router `<Link to="/faq" hash="cost">` (etc.) so clicking navigates to `/faq#cost` and opens that answer.
5. Map the 4 home-page questions to the matching FAQ entry IDs (will need to confirm wording matches — if a home question doesn't have an exact FAQ counterpart, link to the closest one).

**Files to change:**
- `src/routes/faq.tsx` — add ids, add `useEffect` to open the targeted details element on hash.
- `src/routes/index.tsx` — replace `<li>` with `<Link>` + hover styling.

**Notes:**
- Use `<Link to="/faq" hash="signup">` (TanStack Router supports `hash` prop).
- Add `scroll-margin-top` so the opened item isn't hidden under the sticky header.
