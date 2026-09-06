import { allMatches, getTeam, teamsForSport } from "@/lib/league-store";
import { eloGamesFor, eloParamsFor } from "@/lib/elo-store";
import { computeElo, winProbability } from "@/lib/elo";
import { SPORTS, type HomeMatchCard, type Match, type Sport } from "@/lib/types";

function ratings() {
  const map = {} as Record<Sport, { elo: Record<string, number>; c: number }>;
  for (const sport of SPORTS) {
    map[sport] = {
      elo: computeElo(eloGamesFor(sport), eloParamsFor(sport), teamsForSport(sport)).elo,
      c: eloParamsFor(sport).c,
    };
  }
  return map;
}

function toCard(match: Match, pack: ReturnType<typeof ratings>): HomeMatchCard {
  const a = getTeam(match.teamAId);
  const b = getTeam(match.teamBId);
  const { elo, c } = pack[match.sport];
  const eloA = elo[match.teamAId] ?? 1000;
  const eloB = elo[match.teamBId] ?? 1000;
  const pctA = winProbability(eloA, eloB, c);
  return {
    id: match.id,
    sport: match.sport,
    round: match.round,
    date: match.date,
    teamAId: match.teamAId,
    teamBId: match.teamBId,
    teamAName: a?.name ?? "TBD",
    teamBName: b?.name ?? "TBD",
    classAId: a?.classId,
    classBId: b?.classId,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    pctA,
    pctB: 1 - pctA,
  };
}

export function homeMatchCards() {
  const pack = ratings();
  return allMatches().map((match) => toCard(match, pack));
}

export function homeSlate() {
  const cards = homeMatchCards();
  const today = new Date().toISOString().slice(0, 10);
  const todayGames = cards.filter((m) => m.date === today);
  if (todayGames.length) {
    return { heading: "Today's games", date: today, games: todayGames };
  }
  const upcoming = cards.filter((m) => m.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length) {
    const date = upcoming[0].date;
    return { heading: "Next games", date, games: cards.filter((m) => m.date === date) };
  }
  return { heading: "Today's games", date: today, games: [] as HomeMatchCard[] };
}

export function homeMatchLabels() {
  return homeMatchCards().map((match) => ({
    id: match.id,
    label: `${match.sport} · ${match.teamAName} vs ${match.teamBName} (${match.date})`,
  }));
}
