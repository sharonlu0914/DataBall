import type { Sport } from "./types";

export type StatColumn = {
  key: string;
  aliases?: string[];
  label: string;
  kind: "int" | "dec" | "pct";
};

export const STAT_LABELS: Record<string, string> = {
  gp: "GP",
  min: "MIN",
  ppg: "PPG",
  pts: "PTS",
  rpg: "RPG",
  reb: "REB",
  apg: "APG",
  ast: "AST",
  stl: "SPG",
  blk: "BPG",
  tov: "TO",
  fg: "FG%",
  three: "3P%",
  ft: "FT%",
  goals: "G",
  assists: "A",
  sog: "SOG",
  kills: "K",
  digs: "D",
  aces: "ACE",
};

export const BASKETBALL_COLUMNS: StatColumn[] = [
  { key: "gp", label: "GP", kind: "int" },
  { key: "min", label: "MIN", kind: "dec" },
  { key: "ppg", aliases: ["pts"], label: "PPG", kind: "dec" },
  { key: "rpg", aliases: ["reb"], label: "RPG", kind: "dec" },
  { key: "apg", aliases: ["ast"], label: "APG", kind: "dec" },
  { key: "stl", label: "SPG", kind: "dec" },
  { key: "blk", label: "BPG", kind: "dec" },
  { key: "tov", label: "TO", kind: "dec" },
  { key: "fg", label: "FG%", kind: "pct" },
  { key: "three", label: "3P%", kind: "pct" },
  { key: "ft", label: "FT%", kind: "pct" },
];

const SOCCER_COLUMNS: StatColumn[] = [
  { key: "gp", label: "GP", kind: "int" },
  { key: "goals", label: "G", kind: "dec" },
  { key: "assists", aliases: ["apg"], label: "A", kind: "dec" },
  { key: "sog", label: "SOG", kind: "dec" },
];

const VOLLEYBALL_COLUMNS: StatColumn[] = [
  { key: "gp", label: "GP", kind: "int" },
  { key: "kills", label: "K", kind: "dec" },
  { key: "assists", label: "A", kind: "dec" },
  { key: "digs", label: "DIG", kind: "dec" },
  { key: "aces", label: "ACE", kind: "dec" },
];

const ULTIMATE_COLUMNS: StatColumn[] = [
  { key: "gp", label: "GP", kind: "int" },
  { key: "goals", label: "G", kind: "dec" },
  { key: "assists", label: "A", kind: "dec" },
  { key: "blocks", label: "D", kind: "dec" },
];

export function columnsForSport(sport: Sport): StatColumn[] {
  if (sport === "basketball") return BASKETBALL_COLUMNS;
  if (sport === "soccer") return SOCCER_COLUMNS;
  if (sport === "volleyball") return VOLLEYBALL_COLUMNS;
  return ULTIMATE_COLUMNS;
}

export function readStat(stats: Record<string, number> | undefined, col: StatColumn): number | undefined {
  if (!stats) return undefined;
  if (typeof stats[col.key] === "number") return stats[col.key];
  for (const alias of col.aliases ?? []) {
    if (typeof stats[alias] === "number") return stats[alias];
  }
  return undefined;
}

export function formatStat(value: number | undefined, kind: StatColumn["kind"]): string {
  if (value === undefined) return "—";
  if (kind === "int") return String(Math.round(value));
  if (kind === "pct") return value.toFixed(1);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function statLabel(key: string) {
  return STAT_LABELS[key] ?? key.replace(/_/g, " ").toUpperCase();
}
