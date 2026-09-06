import type { EloGame, EloParams, Team } from "@/lib/types";

export const ELO_START = 1000;
export const DEFAULT_ELO_PARAMS: EloParams = { k: 30, c: -0.0055 };

export type EloHistoryRow = {
  game: EloGame;
  winnerBefore: number;
  loserBefore: number;
  winnerAfter: number;
  loserAfter: number;
};

export type EloBoardRow = {
  teamId: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  delta: number | null;
};

export function winProbability(eloA: number, eloB: number, c: number) {
  return 1 / (1 + Math.exp(c * (eloA - eloB)));
}

export function computeElo(games: EloGame[], params: EloParams, roster: Team[]) {
  const elo: Record<string, number> = {};
  for (const team of roster) elo[team.id] = ELO_START;
  const history: EloHistoryRow[] = [];
  const lastDelta: Record<string, number> = {};

  for (const game of games) {
    if (!(game.winnerId in elo)) elo[game.winnerId] = ELO_START;
    if (!(game.loserId in elo)) elo[game.loserId] = ELO_START;
    const winnerBefore = elo[game.winnerId];
    const loserBefore = elo[game.loserId];
    const pWin = winProbability(winnerBefore, loserBefore, params.c);
    const winnerAfter = Math.round(winnerBefore + params.k * (1 - pWin));
    const loserAfter = Math.round(loserBefore - params.k * pWin);
    elo[game.winnerId] = winnerAfter;
    elo[game.loserId] = loserAfter;
    lastDelta[game.winnerId] = winnerAfter - winnerBefore;
    lastDelta[game.loserId] = loserAfter - loserBefore;
    history.push({ game, winnerBefore, loserBefore, winnerAfter, loserAfter });
  }

  const played = new Set<string>();
  const wins: Record<string, number> = {};
  const losses: Record<string, number> = {};
  const gamesPlayed: Record<string, number> = {};
  for (const game of games) {
    played.add(game.winnerId);
    played.add(game.loserId);
    gamesPlayed[game.winnerId] = (gamesPlayed[game.winnerId] ?? 0) + 1;
    gamesPlayed[game.loserId] = (gamesPlayed[game.loserId] ?? 0) + 1;
    wins[game.winnerId] = (wins[game.winnerId] ?? 0) + 1;
    losses[game.loserId] = (losses[game.loserId] ?? 0) + 1;
  }

  const ids = new Set([...roster.map((t) => t.id), ...played]);
  const board: EloBoardRow[] = [...ids]
    .map((teamId) => ({
      teamId,
      elo: elo[teamId] ?? ELO_START,
      games: gamesPlayed[teamId] ?? 0,
      wins: wins[teamId] ?? 0,
      losses: losses[teamId] ?? 0,
      delta: teamId in lastDelta ? lastDelta[teamId] : null,
    }))
    .sort((a, b) => b.elo - a.elo || b.wins - a.wins);

  return { elo, history, board };
}

export function formComment(row: EloBoardRow, rank: number, total: number, recent: EloHistoryRow[]) {
  if (row.games === 0) return "No games logged yet — waiting on the first result.";
  let streak = 0;
  let streakWin: boolean | null = null;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const win = recent[i].game.winnerId === row.teamId;
    if (streakWin === null) {
      streakWin = win;
      streak = 1;
    } else if (win === streakWin) streak += 1;
    else break;
  }
  if (streak >= 3) {
    return streakWin ? `On a ${streak}-game heater.` : `Dropped ${streak} in a row.`;
  }
  if (row.wins === row.games && row.games >= 2) return `${row.games}–0 so far.`;
  if (row.losses === row.games && row.games >= 2) return `Still looking for a first win (${row.games} games).`;
  if (rank === 1) return "Top of the board.";
  if (rank === total && total > 1) return "Last on the board — lots of season left.";
  const rate = row.wins / row.games;
  if (rate >= 0.7) return `Winning ${Math.round(rate * 100)}% of logged games.`;
  if (rate <= 0.3) return "Early going has been rough.";
  if (row.games < 3) return `Only ${row.games} games in — sample is still small.`;
  return "Split results. Matchup-dependent.";
}

export function matchupComment(
  teamAId: string,
  teamBId: string,
  games: EloGame[],
  eloA: number,
  eloB: number,
) {
  const h2h = games.filter(
    (g) =>
      (g.winnerId === teamAId && g.loserId === teamBId) ||
      (g.winnerId === teamBId && g.loserId === teamAId),
  );
  const aWins = h2h.filter((g) => g.winnerId === teamAId).length;
  const bWins = h2h.length - aWins;
  const gap = Math.abs(eloA - eloB);
  if (h2h.length === 0) {
    return gap >= 40
      ? "First meeting, and the ratings are not close."
      : "First meeting. Little on tape besides the rating.";
  }
  if (h2h.length >= 3 && (aWins === h2h.length || bWins === h2h.length)) {
    return `One side has taken all ${h2h.length} prior meetings.`;
  }
  if (h2h.length === 2 && aWins === 1) return "Split the last two. This one breaks the tie.";
  if (aWins > bWins) return `H2H sits ${aWins}–${bWins}.`;
  if (bWins > aWins) return `H2H sits ${bWins}–${aWins} the other way.`;
  return `Even in ${h2h.length} prior games.`;
}
