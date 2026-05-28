// Single source of truth for all camp logistics.
// Update this file to change dates, platform, etc. across the entire site.

export const CAMP = {
  name: "MathOs",
  tagline: "Free online summer applied math camp",
  // MathOs is fully online — sessions run over Zoom.
  platform: {
    name: "Online (Zoom)",
    // Joining link is shared with registered families closer to camp.
    joinNote: "Zoom link sent by email before each session",
  },
  // Camp runs Tue/Thu, 1:00–4:00 PM Central (America/Chicago, CDT = UTC-5 in July/August)
  // Use the FIRST session date as the canonical "start" for ics.
  startDateISO: "2026-07-07", // Tuesday July 7 2026
  endDateISO: "2026-08-13",   // Thursday August 13 2026
  sessionStartTime: "13:00",  // 1:00 PM Central
  sessionEndTime: "16:00",    // 4:00 PM Central
  daysOfWeek: ["Tuesday", "Thursday"],
  // Human-friendly strings used across the site
  humanDateRange: "July – August 2026",
  humanDays: "Tue · Thu",
  humanTime: "Early afternoon Central (3 hr)",
  cost: "Free",
  skillRange: "5th grade math → Geometry",
  contactEmail: "campmathos@gmail.com",
  url: "https://campmathos.lovable.app",
} as const;
