// Data layer for the Camp Director roster, by year. To roll over to a new
// year: append one BoardYear object to `boardYears` below. `/board` always
// shows the most recent entry; `/board-history` shows every year before it.
import aaravPhoto from "@/assets/directors/aarav-arora.jpg";
import yifanPhoto from "@/assets/directors/yifan-bao.jpg";
import alanPhoto from "@/assets/directors/alan-zhan.jpg";
import shauryPhoto from "@/assets/directors/shaury-sharma.jpg.asset.json";
import atharvPhoto from "@/assets/directors/atharv-mishra.jpg.asset.json";
import wenxuanPhoto from "@/assets/directors/wenxuan-chen.jpg.asset.json";

export interface Director {
  name: string;
  bio: string;
  accent: string;
  photo?: string;
}

export interface BoardYear {
  year: number;
  directors: Director[];
}

const aarav: Director = {
  name: "Aarav Arora",
  bio: "NVHS Class of 2029. NVHS Robotics' first-ever sophomore Executive Board Member and a co-creator of NeighbrHub. eCYBERMISSION State Finalist and honorable mention.",
  accent: "bg-electric text-cream",
  photo: aaravPhoto,
};

const alan: Director = {
  name: "Alan Zhan",
  bio: "NVHS Class of 2029. Member of NVHS Computing Team, Chess Team, and Math Team. #1 Neuqua Freshman in State Math, Highest record at state Chess.",
  accent: "bg-sun text-cream",
  photo: alanPhoto,
};

const shaury: Director = {
  name: "Shaury Sharma",
  bio: "NVHS Class of 2029. Member of NVHS Robotics Team, IJAS State Qualifier, NVHS Science Olympiad State Qualifier, and eCYBERMISSION State Finalist and honorable mention.",
  accent: "bg-coral text-cream",
  photo: shauryPhoto.url,
};

const wenxuan: Director = {
  name: "Wenxuan Chen",
  bio: "NVHS Class of 2029. Math Team State Qualifier and member of NVHS Freshman A soccer team. AMC 8 Honor Roll.",
  accent: "bg-electric text-cream",
  photo: wenxuanPhoto.url,
};

const yifan: Director = {
  name: "Yifan Bao",
  bio: "NVHS Class of 2029. Math Team State Qualifier and Science Olympiad State Qualifier. Sci Oly junior executive board member and 2nd place at state.",
  accent: "bg-coral text-cream",
  photo: yifanPhoto,
};

const atharv: Director = {
  name: "Atharv Mishra",
  bio: "NVHS Class of 2029. Member of NVHS Robotics, Speech, and Youth & Government teams, and eCYBERMISSION State Finalist and honorable mention.",
  accent: "bg-sun text-cream",
  photo: atharvPhoto.url,
};

export const boardYears: BoardYear[] = [
  {
    year: 2026,
    directors: [aarav, alan, shaury, wenxuan, yifan, atharv],
  },
  {
    // Same roster as 2026, minus Yifan Bao.
    year: 2027,
    directors: [aarav, alan, shaury, wenxuan, atharv],
  },
];

/** The current board — most recent year on record. */
export function currentBoardYear(): BoardYear {
  return sortedBoardYears()[0];
}

/** Every year before the current one, newest first. */
export function pastBoardYears(): BoardYear[] {
  return sortedBoardYears().slice(1);
}

function sortedBoardYears(): BoardYear[] {
  return [...boardYears].sort((a, b) => b.year - a.year);
}
