# 2026 Through the Years — add camp screenshots to the gallery

All 20 screenshots are in. Single restriction confirmed: the **participant count must never be visible**. Camper faces, names, nicknames, and chat are fine.

## Ranking — most applied / real-world math first

Tier 1 — real-world application, the strongest gallery material
1. Amazon and FedEx routing & packing optimization
2. Which Triangle Is Best? (disaster-relief shelter design)
3. Applications of the Coordinate Plane (real-world uses table)
4. Student final project city graph (applied student work)
5. Transfer and Conservation (surface area vs. volume growth)
6. First Moment of Area (engineering-style T-section, live annotation)

Tier 2 — concept slides with an applied hook
7. Correlation Coefficient (used to judge product/business success) — the final image
8. What Has Counting to Do With This? (counting → probability)
9. Linear Inequalities (shaded feasible regions)
10. What Is Mutually Exclusive? (Venn diagram)

Tier 3 — applied through play/competition, good energy shots
11. Guess the Correlation game screen
12. Blooket Final Standings — Devin / Gautam / kavya
13. Blooket Final Standings — amy / hello people / ivy
14. Blooket live leaderboard (defense game)
15. Blooket live leaderboard with upgrade feed

Tier 4 — plain notes / housekeeping, lowest priority
16. Best Techniques for Studying Geometry
17. Lesson Contents slide

## Final selection

Publish tiers 1–3 (items 1–15) in that order, so the gallery leads with applied math and ends with camp energy. Drop the tier-4 note slides plus:
- **Impostors Win** — no math content, mostly black space.
- **City Planning Requirements doc** — text unreadable at gallery size.

If two Blooket leaderboard crops end up looking near-identical, keep only the sharper one.

## Cropping rules applied to every image

- **Remove the participant count everywhere it appears**: the Zoom bottom-toolbar "Participants 13" badge and the "Participants (13)" panel header. If the participants side panel is kept for context, crop so only the name list shows; otherwise crop the panel away entirely.
- Crop off browser tabs, address bars, bookmark bars, and the Windows taskbar.
- Remove the "Who can see your viewing activity?" banner, casting icon, and black letterbox bars.
- Remove the "Oops! Something went wrong" error toasts on the two 2026-07-09 Zoom shots.
- Keep camper webcam tiles, names, chat, and Blooket nicknames as-is.
- Aim for a clean landscape crop centered on the slide/game content.

## Technical notes

- Crops done with PIL from the uploads, downsized to a web-appropriate width, saved as JPEG.
- Files uploaded through the Lovable assets CLI and referenced by their CDN pointer URLs.
- Appended to the `photos` array of the 2026 entry in `src/data/camp-years.ts`, each with `src`, `alt`, and a short caption. The existing five photos stay first.
- No component changes: `PhotoGallery` on `/through-the-years` already renders whatever the array holds.
- Every finished crop is re-inspected to confirm no participant count survived.

## Verification

- Visual check of each cropped file for a leftover count badge.
- Load `/through-the-years` at mobile and desktop widths and confirm the gallery renders and no other page changed.
