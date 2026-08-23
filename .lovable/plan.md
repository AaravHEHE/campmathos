# Batch 1: photo picks for Through the Years (2026)

Eight screenshots came in. Here's my call on each, plus what needs to happen before any of them go on the page.

## Use — strong picks

1. **"Applications of the Coordinate Plane" slide** (`Screenshot_2026-07-09_151349`)
   Best single image of the batch: real lesson content that shows what camp actually teaches. **Must be cropped** to just the shared slide — the current shot includes the Zoom participant list with camper first names, a private chat pane, browser tabs, and the Windows taskbar.

2. **"Application, Which Triangle is Best?" slide** (`Screenshot_2026-08-18_213506`)
   Great applied-math example (disaster-relief shelter design). Crop out the top browser banner. The Camp Director's webcam tile in the corner can stay — that's a director, not a camper.

3. **"Best techniques for studying Geometry" slide** (`Screenshot_2026-08-18_213343`)
   Clean, on-brand, ties directly to the Geometry curriculum theme. Same crop treatment.

4. **Blooket "Final Standings" podium** (`Screenshot_2026-08-18_213410`)
   Shows the fun/gamified side of camp. Nicknames only (amy, ivy, "hello people") — low privacy risk. Crop the top banner.

5. **Student final project city graph** (`Screenshot_2026-08-18_214003`)
   Excellent proof of student work — a full coordinate-plane city plan with a color legend. **Must crop the student's full name out of the document title**, and crop the browser chrome and the camper webcam tile in the corner.

## Use with heavier editing

6. **Blooket live leaderboard** (`Screenshot_2026-08-18_212719`)
   Good energy, but it duplicates #4 and shows a Camp Director's face plus a personal bookmarks bar. If we want two Blooket images, keep this one and crop tightly to the leaderboard panel only; otherwise skip it in favor of #4.

## Skip

7. **Zoom + Blooket "Oops something went wrong"** (`Screenshot_2026-07-09_154905`)
   Camper faces on webcam, camper names in the participant list, and a visible error message. Not usable.

8. **"Impostors Win" screen** (`Screenshot_2026-08-18_213611`)
   Mostly black space, no math content, reads as off-topic. Skip.

9. **City planning rubric Google Doc** (`Screenshot_2026-08-18_213838`)
   Dense small text that will be unreadable at gallery size. Better used later as curriculum-page material than as a photo.

## Cross-cutting rules I'll apply to every image

- Crop out all browser chrome, tabs, bookmarks, taskbars, and Zoom UI panels.
- No camper faces and no camper full names anywhere in frame.
- Camp Directors on camera are fine.
- Each gets a short caption in the camp's voice and descriptive alt text.

## Technical notes

Approved images get cropped with PIL, saved into `public/through-the-years/2026/`, and appended to the `photos` array of the 2026 entry in `src/data/camp-years.ts`. Nothing else changes — `PhotoGallery` already renders whatever is in that array, lazy-loaded and responsive.

## Next steps

Since two more upload batches are coming (11 more images), I'd suggest holding the actual crop-and-publish work until all three batches are in, so the gallery can be curated as a set rather than appended piecemeal — the final order should tell a story (lesson → activity → student work), not follow upload order. Say the word if you'd rather I ship batch 1 now.
