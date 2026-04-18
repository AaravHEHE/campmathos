export type Week = {
  n: string;
  title: string;
  blurb: string;
  bullets: string[];
  detail: string;
  accent: string;
};

export const weeks: Week[] = [
  {
    n: "01",
    title: "Graphing the real world",
    blurb:
      "Graphs aren't homework — they're how scientists, athletes, and investors read the world.",
    bullets: [
      "Plotting data from real measurements",
      "Linear and parabolic motion in sports",
      "Exponential growth: savings, viruses, populations",
    ],
    detail:
      "We start with the question every student asks: when will I actually use this? In week one, we plot heart rates from a sprint, model a basketball arc with a parabola, and watch a savings account grow exponentially. Every concept comes from a real situation, not a textbook problem. Students leave able to read a chart in a news article and tell whether it's honest or misleading.",
    accent: "bg-electric text-cream",
  },
  {
    n: "02",
    title: "Finance and probability",
    blurb:
      "How banks, casinos, and insurance companies all use the same math — and how to read it.",
    bullets: [
      "Probability with dice, cards, and real games",
      "Compound interest, debt, and the cost of waiting",
      "Expected value: when a deal is actually a deal",
    ],
    detail:
      "Probability and finance are the math adults use every day without realizing it. We run probability experiments by hand, then apply the same thinking to credit cards, savings accounts, and insurance. Students leave knowing how to evaluate a real financial offer and spot a bad bet — a skill most adults never get taught directly.",
    accent: "bg-coral text-cream",
  },
  {
    n: "03",
    title: "Geometry and architecture",
    blurb:
      "Area, volume, and angles aren't decoration — they decide whether a building stands up.",
    bullets: [
      "Area, perimeter, and volume from blueprints",
      "Why triangles hold up bridges and skyscrapers",
      "Designing a tower under real constraints",
    ],
    detail:
      "Geometry becomes obvious once you build something. We measure the library itself, study why bridges use triangles instead of squares, and finish the week with a tower-design challenge where every team works inside a real budget and height limit. Students apply area, perimeter, volume, and angle relationships to a structure they actually have to defend.",
    accent: "bg-sun text-ink",
  },
  {
    n: "04",
    title: "Final project + showcase",
    blurb:
      "Pick a real problem. Use the math from weeks 1–3 to design a working solution.",
    bullets: [
      "City-block planning challenge",
      "Bridge engineering with load testing",
      "Showcase day (Friday) for parents and family",
    ],
    detail:
      "Week four is when everything connects. Students choose a project — planning a city block, engineering a bridge, or pitching their own — and use graphing, probability, and geometry from earlier weeks to defend their design. We finish on the Friday of week 4 with a showcase day where every camper presents their final project to family and friends.",
    accent: "bg-ink text-cream",
  },
];
