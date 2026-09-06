import { eloPredictions, matches, teams } from "@/data/seed";

export { matches, teams };

export function getTeam(id: string) {
  return teams.find((t) => t.id === id);
}

export function predictionFor(matchId: string) {
  return eloPredictions.find((p) => p.matchId === matchId);
}

export function scheduleSlate() {
  const today = new Date().toISOString().slice(0, 10);
  const todayGames = matches.filter((m) => m.date === today);
  if (todayGames.length) {
    return { heading: "Today's slate", date: today, games: todayGames };
  }
  const upcoming = [...matches]
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length) {
    const date = upcoming[0].date;
    return {
      heading: "Next slate",
      date,
      games: matches.filter((m) => m.date === date),
    };
  }
  const latest = [...matches].sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
  return {
    heading: "Latest slate",
    date: latest ?? today,
    games: latest ? matches.filter((m) => m.date === latest) : [],
  };
}
