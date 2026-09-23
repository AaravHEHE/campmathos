// MathOs 2027 Participant Waiver — text supplied by the camp team.
// Do not edit the wording without their approval. Bump WAIVER_VERSION
// whenever the text changes so each enrollment records what was signed.

export const WAIVER_VERSION = "2027-v1";

export const WAIVER_INTRO =
  "MathOs is a free applied math camp run by a 501(c)(3) nonprofit. The 2027 session meets every Tuesday and Thursday from July 6 to July 29, 2027, in person at the Naperville Public Library and online via Zoom. A parent or legal guardian must complete this waiver before a camper can take part.";

export type WaiverAckKey = "risk" | "release" | "supervision" | "emergency" | "conduct";

export const WAIVER_ACKS: Record<WaiverAckKey, string> = {
  risk: "I understand the nature of MathOs activities and the risks described above, and I voluntarily allow my camper to participate.",
  release:
    "To the fullest extent permitted by law, I release MathOs, its co-founders, volunteers, and the Naperville Public Library from liability for injury, loss, or damage arising from my camper's participation, except in cases of gross negligence or intentional misconduct.",
  supervision:
    "I understand that MathOs is not responsible for supervising my camper before drop-off, after pickup, or outside scheduled session times. I am responsible for my camper's supervision and internet safety during Zoom sessions at home.",
  emergency:
    "If my camper needs emergency medical attention during an in-person session and I cannot be reached, I authorize MathOs volunteers to contact emergency services (911) and share the medical information I provided with responders. I understand that MathOs volunteers will not give medical treatment or medication, and that I am responsible for any resulting medical costs.",
  conduct: "My camper and I have read and agree to the MathOs Code of Conduct.",
};

export const WAIVER_SECTIONS: {
  title: string;
  paragraphs?: string[];
  list?: string[];
  after?: string[];
  acks: WaiverAckKey[];
}[] = [
  {
    title: "Acknowledgment of Risk & Release",
    paragraphs: [
      "MathOs is organized and run by high school student volunteers, not licensed teachers or professional childcare providers. Camp activities include hands-on math and design projects, such as building models and using basic craft materials. Activities take place in a public library and online. As with any group activity, there is some risk of minor injury, lost or damaged belongings, or exposure to online content outside MathOs's control.",
    ],
    acks: ["risk", "release", "supervision"],
  },
  {
    title: "Emergency Care Authorization",
    acks: ["emergency"],
  },
  {
    title: "Code of Conduct",
    paragraphs: ["To keep camp safe and fun for everyone, campers agree to:"],
    list: [
      "Treat fellow campers, volunteers, and library staff with kindness and respect.",
      "Follow volunteer instructions and stay with the group during in-person sessions.",
      "Follow Naperville Public Library rules while on library property.",
      "On Zoom, use their real first name, keep chat appropriate, and not share meeting links or record sessions.",
      "Take care of shared materials and supplies.",
    ],
    after: [
      "If a camper's behavior repeatedly disrupts sessions or makes others feel unsafe, MathOs will contact the parent/guardian. MathOs may end a camper's participation if the problem continues.",
    ],
    acks: ["conduct"],
  },
];

export const MEDIA_RELEASE_TEXT =
  "MathOs sometimes shares photos, camper projects, and short clips from sessions and the final showcase on campmathos.com and social media. Camper last names are never published. Choosing \"No\" will not affect your camper's participation.";

export const PHOTO_QUESTION =
  "May MathOs use photos or video of my camper, and images of their projects, in its website, social media, and promotional materials?";

export const RECORDING_QUESTION =
  "May Zoom sessions that include my camper be recorded for internal review and for campers who miss a session?";

export const SIGNATURE_TEXT =
  "By typing my full name below, I confirm that I am the parent or legal guardian of the camper registered on this form, and that this typed name serves as my electronic signature.";
