// Data layer for the "Through the Years" camp archive.
// To add a new year once it wraps: append one CampYear object to
// `campYears` below. The page and every component under it render
// entirely from this array — nothing else needs to change.

export interface PollBucket {
  /** Response label as worded on the survey, e.g. "Very fun!" */
  label: string;
  /** Percentage of respondents who chose this bucket (0-100). */
  percent: number;
}

export interface PollResult {
  question: string;
  scale: 1 | 5;
  /** Clean computed average (e.g. 4.2). Use when you have exact survey math. */
  average?: number;
  responseCount?: number;
  /** Percentage breakdown by response bucket — use when only bucketed results are available rather than a computed average. */
  buckets?: PollBucket[];
  /** A single highlighted aggregate stat, for when only one summary percentage is available rather than a full bucket breakdown. */
  summaryStat?: { percent: number; description: string };
  /** Optional footnote shown under the visual, e.g. a caveat about precision. */
  note?: string;
}

export interface CampPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface CampYear {
  year: number;
  registrants: number;
  sessionDates?: string;
  polls: PollResult[];
  photos: CampPhoto[];
  highlights?: string[];
}

export const campYears: CampYear[] = [
  {
    year: 2026,
    registrants: 60,
    sessionDates: "July 7 – 30, 2026",
    polls: [
      {
        question: "How difficult was the content?",
        scale: 5,
        // Only the aggregate "appropriately challenging" stat is available —
        // no per-bucket breakdown for this question.
        summaryStat: {
          percent: 91.4,
          description:
            'found the difficulty appropriately challenging — "a little hard" to "a little easy," not either extreme',
        },
      },
      {
        question: "How fun was the camp?",
        scale: 5,
        buckets: [
          { label: "Below the midpoint", percent: 0 },
          { label: "In the middle", percent: 26.8 },
          { label: "Fun", percent: 46.3 },
          { label: "Very fun!", percent: 26.8 },
        ],
      },
      {
        question: "How would you rate MathOs overall?",
        scale: 5,
        buckets: [
          { label: "1–2 stars", percent: 0 },
          { label: "3 stars", percent: 31 },
          { label: "4–5 stars", percent: 69 },
        ],
        note: "The 4- and 5-star ratings were split almost evenly.",
      },
    ],
    photos: [
      {
        src: "/through-the-years/2026/director-headset.jpg",
        alt: "A Camp Director wearing a headset, teaching a session from a laptop",
        caption: "Mid-session, headset on.",
      },
      {
        src: "/through-the-years/2026/director-hp-laptop.jpg",
        alt: "A Camp Director working at a laptop before a session",
        caption: "Prepping before the room fills up.",
      },
      {
        src: "/through-the-years/2026/directors-side-by-side.jpg",
        alt: "Two Camp Directors sitting side by side at their laptops",
        caption: "Two directors, two laptops, one lesson plan.",
      },
      {
        src: "/through-the-years/2026/prepping-before-session.jpg",
        alt: "Camp Directors getting set up before a session",
        caption: "Getting things ready before campers log on.",
      },
      // TODO: add more camp photos here as they come in.
    ],
  },
];

/** Most recent year on record, sorted defensively regardless of array order. */
export function latestCampYear(): CampYear {
  return sortedCampYears()[0];
}

/** All years, newest first. */
export function sortedCampYears(): CampYear[] {
  return [...campYears].sort((a, b) => b.year - a.year);
}
