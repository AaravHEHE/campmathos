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
 * JSON-LD EducationEvent schema for the camp. Used on home + local landing.
 */
export function campEventJsonLd() {
  const v = CAMP.venue;
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: `${CAMP.name} — ${CAMP.tagline}`,
    description:
      "Free four-week applied math summer camp for grades 4–7, taught by Neuqua Valley High School students at Naperville Public Library.",
    startDate: `${CAMP.startDateISO}T${CAMP.sessionStartTime}:00-05:00`,
    endDate: `${CAMP.endDateISO}T${CAMP.sessionEndTime}:00-05:00`,
    eventSchedule: {
      "@type": "Schedule",
      byDay: CAMP.daysOfWeek.map((d) => `https://schema.org/${d}`),
      startTime: `${CAMP.sessionStartTime}:00`,
      endTime: `${CAMP.sessionEndTime}:00`,
      scheduleTimezone: "America/Chicago",
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: v.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: v.street,
        addressLocality: v.city,
        addressRegion: v.region,
        postalCode: v.postalCode,
        addressCountry: v.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: v.lat,
        longitude: v.lng,
      },
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
      audienceType: CAMP.ageRange,
    },
    isAccessibleForFree: true,
  };
}
