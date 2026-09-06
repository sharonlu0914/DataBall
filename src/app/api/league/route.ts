import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { saveTeam, saveMatch, deleteMatch, saveRankings, saveChampionships, allChampionships, allSportStats, saveSportStats } from "@/lib/league-store";
import { isSport } from "@/lib/sports";
import type { Championship, Match, RankingRow, SportStatRow, Team } from "@/lib/types";
import { SPORTS } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    kind?: string;
    team?: Team;
    match?: Match;
    deleteMatchId?: string;
    sport?: string;
    rankings?: RankingRow[];
    championship?: Championship;
    deleteChampionship?: { year: number; sport: string };
    stat?: SportStatRow;
    deleteStatId?: string;
  };

  if (body.team && isSport(body.team.sport)) {
    const team: Team = {
      id: body.team.id || `${body.team.sport}-${body.team.classId}-${Date.now().toString().slice(-4)}`,
      sport: body.team.sport,
      classId: body.team.classId,
      name: body.team.name,
      playerIds: body.team.playerIds ?? [],
      group: body.team.group === "B" ? "B" : "A",
    };
    saveTeam(team);
    return NextResponse.json({ team });
  }

  if (body.deleteMatchId) {
    deleteMatch(body.deleteMatchId);
    return NextResponse.json({ ok: true });
  }

  if (body.match && isSport(body.match.sport)) {
    const match: Match = {
      ...body.match,
      id: body.match.id || `m-${Date.now().toString().slice(-6)}`,
      scoreA: body.match.scoreA === null || body.match.scoreA === undefined ? null : Number(body.match.scoreA),
      scoreB: body.match.scoreB === null || body.match.scoreB === undefined ? null : Number(body.match.scoreB),
    };
    saveMatch(match);
    return NextResponse.json({ match });
  }

  if (body.rankings && isSport(body.sport ?? "")) {
    saveRankings(body.sport as (typeof SPORTS)[number], body.rankings);
    return NextResponse.json({ ok: true });
  }

  if (body.championship && isSport(body.championship.sport)) {
    const rows = allChampionships().filter(
      (row) => !(row.sport === body.championship!.sport && row.year === body.championship!.year),
    );
    rows.unshift(body.championship);
    saveChampionships(rows);
    return NextResponse.json({ ok: true });
  }

  if (body.deleteChampionship && isSport(body.deleteChampionship.sport)) {
    saveChampionships(
      allChampionships().filter(
        (row) =>
          !(row.sport === body.deleteChampionship!.sport && row.year === body.deleteChampionship!.year),
      ),
    );
    return NextResponse.json({ ok: true });
  }

  if (body.deleteStatId) {
    saveSportStats(allSportStats().filter((row) => row.id !== body.deleteStatId));
    return NextResponse.json({ ok: true });
  }

  if (body.stat && isSport(body.stat.sport)) {
    const stat: SportStatRow = {
      ...body.stat,
      id: body.stat.id || `st-${Date.now().toString().slice(-6)}`,
      value: Number(body.stat.value),
    };
    const rows = allSportStats().filter((row) => row.id !== stat.id);
    rows.unshift(stat);
    saveSportStats(rows);
    return NextResponse.json({ stat });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
