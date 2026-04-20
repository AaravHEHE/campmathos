## Plan: 33 Features in 5 Phases

You'll approve each phase before I start it. Camp dates/address you'll send next message — until then I'll use placeholders for #2, #7, #36 and swap them in Phase 2.

---

### Phase 1 — Mobile, Accessibility & Polish (8 features)

**#19** Mobile hamburger menu in `SiteHeader` (sheet drawer, all nav links + register CTA)
**#18/21** Mobile-responsive hero — fix clamp() overflow, scale typography on small screens
**#20** Audit all buttons/links to ≥44×44px tap targets
**#14** Global `:focus-visible` ring styles using existing `--electric` color
**#15** Color contrast fixes (cream-on-coral, muted-foreground combos) to WCAG AA
**#27** Dark mode toggle in header — design tokens already exist in `styles.css`
**#30** Custom 404 illustration (replace plain text in `__root.tsx`)
**#31** Loading skeletons for admin dashboard table

### Phase 2 — SEO & Discoverability (7 features) _needs camp info_

**#7** JSON-LD Event schema on home page (uses your real dates/address)
**#8** `sitemap.xml` server route + `robots.txt` static file
**#9** Per-page OG images for About, Curriculum, Details, Board, FAQ, Register (generated as PNGs in `/public`)
**#10** Canonical `<link>` tags on every route
**#12** New `/naperville-math-camp` local SEO landing page
**#36** "Add to calendar" `.ics` download on Details page (uses real dates)
**#2** Countdown timer to camp start date on homepage hero (uses real start date)

### Phase 3 — Animations & Visual Polish (4 features)

**#28** Page transitions with framer-motion (fade between routes)
**#29** Scroll-triggered fade-in animations on section reveals
**#32** Subtle on-brand cursor effect on hero (parallax dots following cursor)
**#25** Self-host Inter + display fonts (remove Google Fonts request)

### Phase 4 — Admin Dashboard Upgrades (4 features)

**#46** Sign-ups-over-time line chart using recharts (already installed)
**#47** Date-range filter + grade filter on the registrations table
**#45** "Email all registrants" form — textarea + send button, sends via existing Resend setup
**#44** Daily email digest to director — new edge function on cron, lists previous 24h sign-ups

### Phase 5 — Lifecycle Communications (5 features)

**#4** Referral / share buttons on register success screen (X, Facebook, copy link, email)
**#51** Welcome email drip — 3 emails (T-30 days, T-7 days, T-1 day before camp)
**#52** SMS reminders — **needs Twilio**: I'll add a phone field to register form, build the integration, you add Twilio creds when ready
**#53** Post-camp survey email — sent automatically 1 day after camp ends, links to a Google Form (you provide URL)

---

### Dropped from your list

**#54, #55, #57** Tests/CI — per your answer, skipped entirely
**#56** Sentry — per your earlier answer, no DSN yet, skipped

---

### How approval works

After this plan, reply with camp info + "approve Phase 1" → I build Phase 1 → you test → reply "approve Phase 2" → and so on. Each phase is one message round so the diff stays reviewable.

### Things I'll need from you mid-build

- Phase 2: real camp dates, times, full street address (next message)
- Phase 4: confirm director email for daily digest (default: campmathos@gmail.com)
- Phase 5: Google Form URL for post-camp survey, Twilio account when ready for SMS, Venmo/PayPal handles for donate page
