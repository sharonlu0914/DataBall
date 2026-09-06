import {
  championships as seedChampionships,
  matches as seedMatches,
  rankingsBySport as seedRankings,
  teams as seedTeams,
} from "@/data/seed";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import type { Championship, Match, RankingRow, Sport, SportStatRow, Team } from "@/lib/types";

function overlayById<T extends { id: string }>(extra: T[], seed: T[]) {
  const seen = new Set(extra.map((row) => row.id));
  return [...extra, ...seed.filter((row) => !seen.has(row.id))];
}

export function allTeams() {
  return overlayById(readJsonFile<Team[]>("data/teams.json", []), seedTeams);
}

export function allMatches() {
  return overlayById(readJsonFile<Match[]>("data/matches.json", []), seedMatches);
}

export function allChampionships() {
  const extra = readJsonFile<Championship[]>("data/championships.json", []);
  if (extra.length) return extra;
  return seedChampionships;
}

export function allSportStats() {
  return readJsonFile<SportStatRow[]>("data/sport-stats.json", []);
}

export function getTeam(id: string) {
  return allTeams().find((team) => team.id === id);
}

export function getMatch(id: string) {
  return allMatches().find((match) => match.id === id);
}

export function teamsForSport(sport: Sport) {
  return allTeams().filter((team) => team.sport === sport);
}

export function matchesForSport(sport: Sport) {
  return allMatches().filter((match) => match.sport === sport);
}

export function rankingFor(sport: Sport) {
  const extra = readJsonFile<Partial<Record<Sport, RankingRow[]>>>("data/rankings.json", {});
  const rows = extra[sport]?.length ? extra[sport]! : seedRankings[sport];
  return [...rows].sort((a, b) => b.elo - a.elo);
}

export function championshipsForSport(sport: Sport) {
  return allChampionships()
    .filter((row) => row.sport === sport)
    .sort((a, b) => b.year - a.year);
}

export function statsForSport(sport: Sport) {
  return allSportStats().filter((row) => row.sport === sport);
}

export function saveTeam(team: Team) {
  const extra = allTeams().filter((row) => row.id !== team.id);
  extra.unshift(team);
  writeJsonFile("data/teams.json", extra);
}

export function saveMatch(match: Match) {
  const extra = allMatches().filter((row) => row.id !== match.id);
  extra.unshift(match);
  writeJsonFile("data/matches.json", extra);
}

export function deleteMatch(id: string) {
  writeJsonFile(
    "data/matches.json",
    allMatches().filter((row) => row.id !== id),
  );
}

export function saveRankings(sport: Sport, rows: RankingRow[]) {
  const extra = readJsonFile<Partial<Record<Sport, RankingRow[]>>>("data/rankings.json", {});
  extra[sport] = rows;
  writeJsonFile("data/rankings.json", extra);
}

export function saveChampionships(rows: Championship[]) {
  writeJsonFile("data/championships.json", rows);
}

export function saveSportStats(rows: SportStatRow[]) {
  writeJsonFile("data/sport-stats.json", rows);
}

export function groupStandings(sport: Sport, group: "A" | "B") {
  const teams = teamsForSport(sport).filter((team) => team.group === group);
  const games = matchesForSport(sport).filter((match) => match.round === `Group ${group}`);
  return teams
    .map((team) => {
      let wins = 0;
      let losses = 0;
      let draws = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;
      for (const match of games) {
        const home = match.teamAId === team.id;
        const away = match.teamBId === team.id;
        if (!home && !away) continue;
        if (match.scoreA === null || match.scoreB === null) continue;
        const ours = home ? match.scoreA : match.scoreB;
        const theirs = home ? match.scoreB : match.scoreA;
        pointsFor += ours;
        pointsAgainst += theirs;
        if (ours > theirs) wins += 1;
        else if (ours < theirs) losses += 1;
        else draws += 1;
      }
      return { team, wins, losses, draws, pointsFor, pointsAgainst, pd: pointsFor - pointsAgainst };
    })
    .sort((a, b) => b.wins - a.wins || b.pd - a.pd || b.pointsFor - a.pointsFor);
}
