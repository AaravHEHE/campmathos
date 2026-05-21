import { CAMP } from "./camp";

/**
 * Generate an .ics calendar string for every camp session (Tue/Thu 1–4 PM local)
 * between CAMP.startDateISO and CAMP.endDateISO.
 *
 * Times are emitted in floating local time with TZID=America/Chicago so
 * calendars render them as 1:00 PM CT regardless of the user's locale.
 */
export function buildCampIcs(): string {
  const sessions = enumerateSessions();
  const dtstamp = formatUtcStamp(new Date());

  const events = sessions
    .map((d, i) => {
      const dtStart = formatLocalStamp(d, CAMP.sessionStartTime);
      const dtEnd = formatLocalStamp(d, CAMP.sessionEndTime);
      const uid = `mathos-${d}-${i}@campmathos.lovable.app`;
      return [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;TZID=America/Chicago:${dtStart}`,
        `DTEND;TZID=America/Chicago:${dtEnd}`,
        `SUMMARY:MathOs session`,
        `LOCATION:${escapeIcs(`${CAMP.venue.name}, ${CAMP.venue.street}, ${CAMP.venue.city}, ${CAMP.venue.region} ${CAMP.venue.postalCode}`)}`,
        `DESCRIPTION:${escapeIcs(
          "MathOs — free applied math camp (5th grade math → Geometry). Bring a notebook, pencil, and a snack. Questions: campmathos@gmail.com"
        )}`,
        `URL:${CAMP.url}/details`,
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MathOs//Camp Schedule 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Chicago",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0600",
    "TZOFFSETTO:-0500",
    "TZNAME:CDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function enumerateSessions(): string[] {
  // Sessions: every Tue/Thu between startDateISO and endDateISO inclusive.
  const out: string[] = [];
  const start = new Date(`${CAMP.startDateISO}T00:00:00Z`);
  const end = new Date(`${CAMP.endDateISO}T00:00:00Z`);
  const d = new Date(start);
  while (d.getTime() <= end.getTime()) {
    const day = d.getUTCDay(); // 0 Sun .. 6 Sat
    if (day === 2 || day === 4) {
      out.push(toIsoDate(d));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocalStamp(isoDate: string, hhmm: string): string {
  // YYYYMMDDTHHMMSS for floating local time anchored to TZID
  const [y, m, d] = isoDate.split("-");
  const [h, min] = hhmm.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function formatUtcStamp(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${da}T${h}${mi}${s}Z`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
