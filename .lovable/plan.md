# 2026 Through the Years — add camp screenshots to the gallery

Single restriction confirmed: the **participant count must never be visible**. Camper faces, names, nicknames, and chat are fine.

## What gets added (16 images, in gallery order)

Story order: lesson → applied math → activity → student work → community.

1. Applications of the Coordinate Plane slide
2. Lesson Contents slide
3. Linear Inequalities slide
4. What Is Mutually Exclusive? slide
5. What Has Counting to Do With This? slide
6. Amazon and FedEx optimization slide
7. Which Triangle Is Best? slide
8. Best Techniques for Studying Geometry slide
9. Transfer and Conservation slide
10. First Moment of Area slide (with live annotation)
11. Guess the Correlation game screen
12. Blooket live leaderboard (orange defense game)
13. Blooket live leaderboard with upgrade feed
14. Blooket Final Standings — Devin / Gautam / kavya
15. Blooket Final Standings — amy / hello people / ivy
16. Student final project city graph

## Not added

- **Impostors Win** — no math content, mostly empty black space.
- **City Planning Requirements doc** — text too small to read at gallery size.
- One of the two near-identical Zoom+Blooket leaderboard shots if the crops end up looking duplicated; keep the sharper one.

## Cropping rules applied to every image

- **Remove the participant count everywhere it appears**: the Zoom bottom-toolbar "Participants 13" badge, and the "Participants (13)" panel header. Where the participants side panel is kept for context, it will be cropped so only the name list shows, never the count in the header — otherwise the whole panel is cropped away.
- Crop off browser tabs, address bars, bookmark bars, and the Windows taskbar.
- Remove the "Who can see your viewing activity?" banner, the casting icon, and black letterbox strips.
- Remove the "Oops! Something went wrong" error toasts on the two 2026-07-09 Zoom shots.
- Keep camper webcam tiles, names, chat, and Blooket nicknames as-is.
- Keep the student name on the final project graph.
- Aim for a clean landscape crop centered on the slide/game content.

## Technical notes

- Crops done with PIL from the uploads, then each image is downsized to a web-appropriate width and saved as JPEG.
- Files uploaded through the Lovable assets CLI and referenced by their CDN pointer URLs.
- Appended to the `photos` array of the 2026 entry in `src/data/camp-years.ts`, each with `src`, `alt`, and a short caption in the camp's voice. The existing five photos stay first.
- No component changes: `PhotoGallery` on `/through-the-years` already renders whatever the array holds.
- Every finished crop is re-inspected to confirm no participant count survived before it is added.

## Verification

- Visual check of each cropped file for a leftover count badge.
- Load `/through-the-years` at mobile and desktop widths and confirm the gallery renders and no other page changed.
