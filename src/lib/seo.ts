import { CAMP } from "./camp";

const SITE_URL = CAMP.url;

/**
 * Build a meta array entry for a canonical link. TanStack Router merges
 * `links` from parent + child routes, with deeper routes overriding by `rel`.
 */
export function canonical(path: string) {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return { rel: "canonical", href: `${SITE_URL}${clean}` };
}

/**
 * Resolve an OG image stored under /public to an absolute URL so social
 * crawlers can fetch it.
 */
export function ogImage(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * JSON-LD EducationEvent schema for the camp (hybrid — in person + online).
 */
export function campEventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: `${CAMP.name} — ${CAMP.tagline}`,
      description:
      "Free multi-week hybrid applied math summer camp — join in person or live over Zoom — taught by the math team. Recommended skill range: 4th grade math through 7th grade math.",
    startDate: `${CAMP.startDateISO}T${CAMP.sessionStartTime}:00-05:00`,
    endDate: `${CAMP.endDateISO}T${CAMP.sessionEndTime}:00-05:00`,
    eventSchedule: {
      "@type": "Schedule",
      byDay: CAMP.daysOfWeek.map((d) => `https://schema.org/${d}`),
      startTime: `${CAMP.sessionStartTime}:00`,
      endTime: `${CAMP.sessionEndTime}:00`,
      scheduleTimezone: "America/Chicago",
    },
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: `${SITE_URL}/register`,
    },
    organizer: {
      "@type": "Organization",
      name: CAMP.name,
      url: SITE_URL,
      email: CAMP.contactEmail,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/register`,
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: CAMP.skillRange,
    },
    isAccessibleForFree: true,
  };
}
