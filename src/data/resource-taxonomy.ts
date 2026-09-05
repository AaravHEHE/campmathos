import { weeks } from "./weeks";

/**
 * Fixed taxonomy for the Resources portal.
 *
 * Week numbers + topic names are derived from the camp curriculum
 * (`src/data/weeks.ts`) so the Resources page can never drift from the
 * curriculum shown elsewhere on the site. Both school levels use the same
 * four weeks; only the materials inside them differ.
 */

export const SCHOOL_LEVELS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
] as const;

export type SchoolLevel = (typeof SCHOOL_LEVELS)[number]["value"];

export const RESOURCE_CATEGORIES = [
  { value: "notes", label: "Notes" },
  { value: "slideshows", label: "Slideshows" },
  { value: "games", label: "Blookets/Games" },
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]["value"];

export type CurriculumWeek = {
  number: number;
  /** Short topic label, e.g. "Graphing". */
  topic: string;
  /** Full curriculum title, e.g. "Graphing for engineering". */
  title: string;
};

/** Shorten a curriculum title into a one/two word topic label. */
function toTopic(title: string): string {
  const head = title.split(/\s+(?:for|and)\s+/i)[0]?.trim() ?? title;
  return head.charAt(0).toUpperCase() + head.slice(1);
}

export const CURRICULUM_WEEKS: CurriculumWeek[] = weeks.map((w, i) => ({
  number: i + 1,
  topic: toTopic(w.title),
  title: w.title,
}));

export function weekLabel(n: number): string {
  const w = CURRICULUM_WEEKS.find((x) => x.number === n);
  return w ? `Week ${w.number} (${w.topic})` : `Week ${n}`;
}

export function levelLabel(value: string): string {
  return SCHOOL_LEVELS.find((l) => l.value === value)?.label ?? value;
}

export function categoryLabel(value: string): string {
  return RESOURCE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
