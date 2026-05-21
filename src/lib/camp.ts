// Single source of truth for all camp logistics.
// Update this file to change dates, address, etc. across the entire site.

export const CAMP = {
  name: "MathOs",
  tagline: "Free summer applied math camp",
  // Naperville Public Library — 95th Street Branch
  venue: {
    name: "Naperville Public Library — 95th Street Branch",
    street: "3015 Cedar Glade Dr",
    city: "Naperville",
    region: "IL",
    postalCode: "60564",
    country: "US",
    // Approximate coordinates for the 95th Street Branch
    lat: 41.7222,
    lng: -88.1469,
  },
  // Camp runs Tue/Thu, 1:00–4:00 PM local (America/Chicago, CDT = UTC-5 in June/July)
  // Use the FIRST session date as the canonical "start" for countdown + ics.
  startDateISO: "2026-06-02", // Tuesday June 2 2026
  endDateISO: "2026-07-09",   // Thursday July 9 2026
  sessionStartTime: "13:00",  // 1:00 PM local
  sessionEndTime: "16:00",    // 4:00 PM local
  daysOfWeek: ["Tuesday", "Thursday"],
  // Human-friendly strings used across the site (intentionally vague — exact schedule shared closer to camp)
  humanDateRange: "June – July 2026",
  humanDays: "Tue · Thu",
  humanTime: "Late morning – early afternoon",
  cost: "Free",
  skillRange: "5th grade math → Geometry",
  contactEmail: "campmathos@gmail.com",
  url: "https://campmathos.lovable.app",
} as const;

export function fullAddress(): string {
  const v = CAMP.venue;
  return `${v.name}, ${v.street}, ${v.city}, ${v.region} ${v.postalCode}`;
}
