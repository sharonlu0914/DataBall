import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { DEFAULT_ELO_PARAMS } from "@/lib/elo";
import type { EloGame, EloParams, Sport } from "@/lib/types";

type EloFile = {
  params: Partial<Record<Sport, EloParams>>;
  games: EloGame[];
};

function readElo(): EloFile {
  return readJsonFile<EloFile>("data/elo.json", { params: {}, games: [] });
}

export function eloParamsFor(sport: Sport): EloParams {
  return readElo().params[sport] ?? DEFAULT_ELO_PARAMS;
}

export function eloGamesFor(sport: Sport): EloGame[] {
  return readElo().games.filter((game) => game.sport === sport);
}

export function saveEloParams(sport: Sport, params: EloParams) {
  const file = readElo();
  file.params[sport] = params;
  writeJsonFile("data/elo.json", file);
}

export function saveEloGame(game: EloGame, insertIndex?: number) {
  const file = readElo();
  const existing = file.games.findIndex((row) => row.id === game.id);
  if (existing >= 0) {
    file.games[existing] = game;
    writeJsonFile("data/elo.json", file);
    return;
  }
  const others = file.games.filter((row) => row.id !== game.id);
  const sportGames = others.filter((row) => row.sport === game.sport);
  const rest = others.filter((row) => row.sport !== game.sport);
  if (insertIndex === undefined || insertIndex < 0 || insertIndex >= sportGames.length) {
    sportGames.push(game);
  } else {
    sportGames.splice(insertIndex, 0, game);
  }
  file.games = [...rest, ...sportGames];
  writeJsonFile("data/elo.json", file);
}

export function deleteEloGame(id: string) {
  const file = readElo();
  file.games = file.games.filter((row) => row.id !== id);
  writeJsonFile("data/elo.json", file);
}
