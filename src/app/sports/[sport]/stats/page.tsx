import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { allPlayers, rankingFor, getTeam } from "@/data/queries";
import { statsForSport } from "@/lib/league-store";
import { Card, PageHeader, StatBar } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { StatsEditor } from "@/components/LeagueEditors";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} stats` : "Stats" };
}

export default async function StatsPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const table = rankingFor(sport);
  const maxElo = Math.max(1, ...table.map((r) => r.elo));
  const custom = statsForSport(sport);
  const sportPlayers = allPlayers().filter((p) => p.sports.includes(sport));
  const statKey =
    sport === "basketball" ? "ppg" : sport === "soccer" ? "goals" : sport === "volleyball" ? "kills" : "goals";
  const values = sportPlayers
    .map((p) => ({ name: p.name, value: p.stats[sport]?.[statKey] ?? p.stats[sport]?.assists ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const leaders = custom.length
    ? custom.map((row) => ({ name: `${row.name} (${row.label})`, value: row.value }))
    : values;
  const maxStat = Math.max(1, ...leaders.map((v) => v.value));
  const editor = await isEditor();

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={sportLabel(sport)}
        title="Stats"
        lede="League-wide charts first. Editors can add and update leaders for this sport."
      />
      {editor ? <StatsEditor sport={sport} rows={custom} /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Team Elo</h2>
          <div className="space-y-3">
            {table.map((row) => (
              <StatBar
                key={row.teamId}
                label={getTeam(row.teamId)?.name ?? row.teamId}
                value={row.elo}
                max={maxElo}
              />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Leaders</h2>
          <div className="space-y-3">
            {leaders.map((row) => (
              <StatBar key={row.name} label={row.name} value={row.value} max={maxStat} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
