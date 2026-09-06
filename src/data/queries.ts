import { championships, matches, news, rankingsBySport, teams } from "@/data/seed";
import { allClasses, allPlayers } from "@/lib/school-store";
import { allNews } from "@/lib/news-store";
import {
  allMatches,
  allTeams,
  championshipsForSport,
  getMatch,
  getTeam,
  matchesForSport,
  rankingFor,
  teamsForSport,
} from "@/lib/league-store";
import type { Sport } from "@/lib/types";

export function getClass(id: string) {
  return allClasses().find((c) => c.id === id);
}

export function getPlayer(id: string) {
  return allPlayers().find((p) => p.id === id);
}

export { predictionFor, scheduleSlate } from "@/data/live";
export { getMatch, getTeam, matchesForSport, rankingFor, teamsForSport, championshipsForSport, allMatches };

export function teamsForClass(classId: string) {
  return allTeams().filter((t) => t.classId === classId);
}

export function playersInClass(classId: string) {
  return allPlayers().filter((p) => p.classId === classId);
}

export function newsForSport(sport?: Sport) {
  const sorted = allNews();
  if (!sport) return sorted;
  return sorted.filter((n) => n.sport === sport);
}

export { championships, matches, news, teams, rankingsBySport };
export { allClasses, allPlayers, allSportsDayRecords, allLeagueRecords } from "@/lib/school-store";
