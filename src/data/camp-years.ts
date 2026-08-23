// Data layer for the "Through the Years" camp archive.
// To add a new year once it wraps: append one CampYear object to
// `campYears` below. The page and every component under it render
// entirely from this array — nothing else needs to change.

import amazonFedex from "@/assets/camp2026/amazon-fedex-optimization.jpg.asset.json";
import whichTriangle from "@/assets/camp2026/which-triangle-is-best.jpg.asset.json";
import coordinatePlane from "@/assets/camp2026/coordinate-plane-applications.jpg.asset.json";
import cityPlanGraph from "@/assets/camp2026/student-city-plan-graph.jpg.asset.json";
import transferConservation from "@/assets/camp2026/transfer-and-conservation.jpg.asset.json";
import firstMomentArea from "@/assets/camp2026/first-moment-of-area.jpg.asset.json";
import correlationCoefficient from "@/assets/camp2026/correlation-coefficient.jpg.asset.json";
import countingProbability from "@/assets/camp2026/counting-and-probability.jpg.asset.json";
import linearInequalities from "@/assets/camp2026/linear-inequalities.jpg.asset.json";
import mutuallyExclusive from "@/assets/camp2026/mutually-exclusive.jpg.asset.json";
import guessCorrelation from "@/assets/camp2026/guess-the-correlation.jpg.asset.json";
import blooketStandings from "@/assets/camp2026/blooket-final-standings.jpg.asset.json";
import blooketPodium from "@/assets/camp2026/blooket-podium.jpg.asset.json";
import blooketLeaderboard from "@/assets/camp2026/blooket-live-leaderboard.jpg.asset.json";
import blooketUpgrades from "@/assets/camp2026/blooket-upgrade-feed.jpg.asset.json";



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

export interface Testimonial {
  quote: string;
  author: string;
}

export interface CampYear {
  year: number;
  registrants: string | number;

  sessionDates?: string;
  /** Geographic reach — how far campers were spread out, not just local turnout. */
  reach?: { timezones: number; states: number; schools: number; gradeLevels: number };
  polls: PollResult[];
  photos: CampPhoto[];
  testimonials?: Testimonial[];
  highlights?: string[];
}

export const campYears: CampYear[] = [
  {
    year: 2026,
    registrants: "60+",
    sessionDates: "July 7 – 30, 2026",
    reach: { timezones: 3, states: 5, schools: 18, gradeLevels: 6 },
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
      {
        src: "/through-the-years/2026/live-zoom-session.jpg",
        alt: "Campers and Camp Directors together during a live Zoom session, with the group chat open alongside the video grid",
        caption: "A full house on Zoom — shared with parent consent.",
      },
      {
        src: amazonFedex.url,
        alt: "Camp slide titled Amazon and FedEx, framing package routing as an optimization problem with weight and space limits",
        caption: "Optimization, disguised as a delivery truck.",
      },
      {
        src: whichTriangle.url,
        alt: "Camp slide asking which triangle is best for a disaster-relief shelter design",
        caption: "Geometry with real stakes: designing relief shelters.",
      },
      {
        src: coordinatePlane.url,
        alt: "Camp slide listing applications of the coordinate plane across geolocation, engineering, physics, economics, astronomy, statistics, topography, and medicine",
        caption: "Where the coordinate plane actually shows up.",
      },
      {
        src: cityPlanGraph.url,
        alt: "A camper's final project: a color-coded city plan graphed on grid paper with a legend for houses, roads, parks, and businesses",
        caption: "A camper's final project — an entire city, graphed.",
      },
      {
        src: transferConservation.url,
        alt: "Camp slide on transfer and conservation, comparing how surface area and volume grow at different rates",
        caption: "Why bigger isn't just bigger: surface area vs. volume.",
      },
      {
        src: firstMomentArea.url,
        alt: "Camp slide on the first moment of area with an annotated T-shaped cross-section",
        caption: "Engineering math, annotated live.",
      },
      {
        src: correlationCoefficient.url,
        alt: "Camp slide explaining the correlation coefficient with scatter plots for r = 1 and r = 0",
        caption: "How strong is that pattern, really?",
      },
      {
        src: countingProbability.url,
        alt: "Camp slide asking what counting has to do with probability, with a probability formula",
        caption: "Counting carefully is most of probability.",
      },
      {
        src: linearInequalities.url,
        alt: "Camp slide on linear inequalities with shaded solution regions on a graph",
        caption: "Shading the region where every condition holds.",
      },
      {
        src: mutuallyExclusive.url,
        alt: "Camp slide explaining mutually exclusive events with a Venn diagram",
        caption: "Mutually exclusive, one Venn diagram at a time.",
      },
      {
        src: guessCorrelation.url,
        alt: "The Guess the Correlation game showing a scatter plot and a camper's guess of 0.6",
        caption: "Eyeballing correlation, competitively.",
      },
      {
        src: blooketStandings.url,
        alt: "Blooket final standings podium from a camp review game",
        caption: "Review game podium — hard-earned.",
      },
      {
        src: blooketPodium.url,
        alt: "Blooket final standings podium from another camp review game",
        caption: "Another day, another leaderboard.",
      },
      {
        src: blooketLeaderboard.url,
        alt: "Live Blooket leaderboard during a camp review game with campers advancing through rounds",
        caption: "Live scores climbing during review.",
      },
      {
        src: blooketUpgrades.url,
        alt: "Live Blooket leaderboard with a feed of campers upgrading their in-game abilities",
        caption: "Math practice with an upgrade feed.",
      },
      // TODO: add more camp photos here as they come in.

    ],
    testimonials: [
      {
        quote:
          "The experience was enjoyable for everyone and thank you for the tremendous effort and dedication for the camp. We truly appreciate everything you guys did.",
        author: "A camp parent",
      },
      {
        quote: "I really enjoy you teaching me, thank you!",
        author: "A camper",
      },
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
