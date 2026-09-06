import type { LeagueRecord, Player, SchoolClass, SportsDayRecord } from "@/lib/types";
import {
  classes as seedClasses,
  leagueRecords as seedLeague,
  players as seedPlayers,
  sportsDayRecords as seedSportsDay,
} from "@/data/seed";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";

export function extraClasses() {
  return readJsonFile<SchoolClass[]>("data/classes.json", []);
}

export function extraPlayers() {
  return readJsonFile<Player[]>("data/players.json", []);
}

export function extraSportsDay() {
  return readJsonFile<SportsDayRecord[]>("data/sports-day.json", []);
}

export function extraLeagueRecords() {
  return readJsonFile<LeagueRecord[]>("data/league-records.json", []);
}

export function allClasses() {
  const extras = extraClasses();
  const seen = new Set(extras.map((c) => c.id));
  return [...extras, ...seedClasses.filter((c) => !seen.has(c.id))];
}

export function allPlayers() {
  const extras = extraPlayers();
  const seen = new Set(extras.map((p) => p.id));
  return [...extras, ...seedPlayers.filter((p) => !seen.has(p.id))];
}

export function allSportsDayRecords() {
  return [...extraSportsDay(), ...seedSportsDay];
}

export function allLeagueRecords() {
  return [...extraLeagueRecords(), ...seedLeague];
}

export function saveClass(klass: SchoolClass) {
  const extras = extraClasses().filter((c) => c.id !== klass.id);
  extras.unshift(klass);
  writeJsonFile("data/classes.json", extras);
}

export function savePlayer(player: Player) {
  const extras = extraPlayers().filter((p) => p.id !== player.id);
  extras.unshift(player);
  writeJsonFile("data/players.json", extras);
}

export function saveSportsDayRecord(row: SportsDayRecord) {
  const extras = extraSportsDay();
  extras.unshift(row);
  writeJsonFile("data/sports-day.json", extras);
}

export function saveLeagueRecord(row: LeagueRecord) {
  const extras = extraLeagueRecords();
  extras.unshift(row);
  writeJsonFile("data/league-records.json", extras);
}
