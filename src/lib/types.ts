export const SPORTS = ["basketball", "soccer", "volleyball", "ultimate"] as const;
export type Sport = (typeof SPORTS)[number];

export type NewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  sport?: Sport;
  featured?: boolean;
  blocks?: NewsBlock[];
};

export type NewsBlock =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; url: string; caption?: string }
  | { id: string; type: "video"; url: string; caption?: string };

export type Player = {
  id: string;
  name: string;
  classId: string;
  sports: Sport[];
  bio: string;
  stats: Partial<Record<Sport, Record<string, number>>>;
};

export type SchoolClass = {
  id: string;
  name: string;
  grade: number;
};

export type Team = {
  id: string;
  sport: Sport;
  classId: string;
  name: string;
  playerIds: string[];
  group?: "A" | "B";
};

export type Match = {
  id: string;
  sport: Sport;
  round: string;
  date: string;
  teamAId: string;
  teamBId: string;
  scoreA: number | null;
  scoreB: number | null;
  videoUrl?: string;
  notes?: string;
  boxScore?: { playerId: string; label: string; value: number }[];
};

export type RankingRow = {
  teamId: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  elo: number;
};

export type SportsDayRecord = {
  id: string;
  year: number;
  event: string;
  holder: string;
  className: string;
  mark: string;
};

export type LeagueRecord = {
  id: string;
  sport: Sport;
  title: string;
  holder: string;
  className: string;
  mark: string;
  year: number;
  note?: string;
  imageUrl?: string;
};

export type Championship = {
  year: number;
  sport: Sport;
  championTeamId: string;
  runnerUpTeamId: string;
  videoUrl?: string;
};

export type SportStatRow = {
  id: string;
  sport: Sport;
  name: string;
  label: string;
  value: number;
};

export type EloPrediction = {
  matchId: string;
  teamAWinPct: number;
  teamBWinPct: number;
};

export type EloParams = {
  k: number;
  c: number;
};

export type EloGame = {
  id: string;
  sport: Sport;
  winnerId: string;
  loserId: string;
  note?: string;
  folder?: string;
};

export type HomeMatchCard = {
  id: string;
  sport: Sport;
  round: string;
  date: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  classAId?: string;
  classBId?: string;
  scoreA: number | null;
  scoreB: number | null;
  pctA: number;
  pctB: number;
};

export const HOME_WIDGET_TYPES = ["elo", "schedule", "news", "results", "brackets", "note"] as const;
export type HomeWidgetType = (typeof HOME_WIDGET_TYPES)[number];

export type HomeWidgetLink = { href: string; label: string };

export type HomeWidget = {
  id: string;
  type: HomeWidgetType;
  size?: "wide" | "square";
  title?: string;
  note?: string;
  body?: string;
  imageUrl?: string;
  matchIds?: string[];
  slugs?: string[];
  links?: HomeWidgetLink[];
};
