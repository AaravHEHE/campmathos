
## Goal

Add four hand-crafted illustrations that match the existing MathOs visual style (cream/ink/electric/coral/sun palette, paper grain, bold outlines, slight zine/blueprint feel).

## Images to generate

1. **Graphing → paper-style bridge graph** (`src/assets/theme-graphing.png`)
   - A suspension/truss bridge plotted on graph paper, drawn with ink lines and a parabolic cable curve overlaid on a coordinate grid. Cream background, electric-blue accents.

2. **Probability → rolling pair of dice** (`src/assets/theme-probability.png`)
   - Two tumbling dice mid-roll with motion lines and small probability fractions floating around them. Paper-grain texture, coral accents.

3. **Geometry → shape decomposition / blueprint** (`src/assets/theme-geometry.png`)
   - A complex building silhouette broken down into triangles, rectangles, and circles, drawn in blueprint style (white linework on cream/blue) with dimension marks. Sun-yellow accent.

4. **About hero → "learning" composite** (`src/assets/about-learning.png`)
   - One illustration combining a graph curve, dice, and geometric shapes into a single editorial collage. Ink outlines, all four brand colors, paper texture. Square-ish for the hero right column.

All generated via `imagegen--generate_image` at `premium` quality (these are hero/feature illustrations, no text required, so standard tier is fine — using premium for the about hero only, standard for the three theme cards to keep cost down).

## Code changes

### `src/routes/curriculum.tsx` — Three themes grid (around lines 65–95)

Each of the three theme `<article>` cards currently has just a tag + title + body. Add an image above the tag:

```tsx
<img src={themeImg} alt="" className="mb-5 h-40 w-full rounded-2xl border-2 border-cream/30 object-cover" />
```

Import the three new assets at the top of the file and map them into the theme objects.

### `src/routes/about.tsx` — Hero section (around lines 73–93)

Currently the hero is a single column. Restructure into a two-column grid on `md+`:
- Left (md:col-span-7): existing eyebrow + h1 + paragraph
- Right (md:col-span-5): new `about-learning.png` in a rounded bordered frame with the signature `shadow-[8px_8px_0_0_var(--ink)]` treatment, slight rotation for character

Mobile stays single column (image below text).

## Out of scope

- No copy changes.
- No changes to the four week cards lower on the curriculum page.
- No new routes or components.
