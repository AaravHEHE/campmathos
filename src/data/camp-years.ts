// Data layer for the "Through the Years" camp archive.
// To add a new year once it wraps: append one CampYear object to
// `campYears` below. The page and every component under it render
// entirely from this array — nothing else needs to change.

export interface PollResult {
  question: string;
  scale: 1 | 5;
  average: number;
  responseCount: number;
  distribution?: Record<1 | 2 | 3 | 4 | 5, number>;
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
      // TODO: replace with real poll data — averages and response counts
      // below are placeholders until the end-of-camp survey results come in.
      { question: "How difficult was the content?", scale: 5, average: 3.2, responseCount: 45 },
      { question: "How fun was the camp?", scale: 5, average: 4.6, responseCount: 45 },
      { question: "How would you rate the learning?", scale: 5, average: 4.4, responseCount: 45 },
    ],
    // TODO: add camp photos here once available, e.g.
    // { src: "/through-the-years/2026/showcase.jpg", alt: "...", caption: "..." }
    // Files should live under public/through-the-years/2026/. The gallery
    // renders a tasteful empty state until then.
    photos: [],
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
