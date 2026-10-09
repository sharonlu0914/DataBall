import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { allPlayers, getClass } from "@/data/queries";
import { statsForSport } from "@/lib/league-store";
import { Card, PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { StatsEditor } from "@/components/LeagueEditors";
import {
  columnsForSport,
  formatStat,
  readStat,
  statLabel,
  type StatColumn,
} from "@/lib/stat-columns";
import type { Player, Sport } from "@/lib/types";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} stats` : "Stats" };
}

function columnsInUse(sport: Sport, players: Player[]): StatColumn[] {
  const preferred = columnsForSport(sport);
  const used = preferred.filter((col) => players.some((p) => readStat(p.stats[sport], col) !== undefined));
  if (used.length) return used;
  const keys = new Set<string>();
  for (const player of players) {
    for (const key of Object.keys(player.stats[sport] ?? {})) keys.add(key);
  }
  return [...keys].map((key) => ({ key, label: statLabel(key), kind: "dec" as const }));
}

function leaderFor(sport: Sport, players: Player[], col: StatColumn) {
  return [...players]
    .map((player) => ({ player, value: readStat(player.stats[sport], col) }))
    .filter((row): row is { player: Player; value: number } => row.value !== undefined)
    .sort((a, b) => b.value - a.value)[0];
}

export default async function StatsPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const custom = statsForSport(sport);
  const sportPlayers = allPlayers().filter((p) => p.sports.includes(sport));
  const cols = columnsInUse(sport, sportPlayers);
  const sortCol = cols.find((c) => !["gp", "min"].includes(c.key)) ?? cols[0];
  const rows = [...sportPlayers].sort((a, b) => {
    if (!sortCol) return a.name.localeCompare(b.name);
    return (readStat(b.stats[sport], sortCol) ?? -1) - (readStat(a.stats[sport], sortCol) ?? -1);
  });
  const maxima = Object.fromEntries(
    cols.map((col) => [
      col.key,
      Math.max(-Infinity, ...rows.map((p) => readStat(p.stats[sport], col) ?? -Infinity)),
    ]),
  );
  const spotlight = (
    sport === "basketball"
      ? columnsForSport(sport).filter((c) => ["ppg", "rpg", "apg"].includes(c.key))
      : cols.filter((c) => !["gp", "min"].includes(c.key)).slice(0, 3)
  )
    .map((col) => {
      const lead = leaderFor(sport, sportPlayers, col);
      return lead ? { col, ...lead } : null;
    })
    .filter((row): row is { col: StatColumn; player: Player; value: number } => row !== null);
  const editor = await isEditor();

  return (
    <div className="space-y-8">
      <PageHeader
        kicker={sportLabel(sport)}
        title="Stats"
        lede="Per-game averages in an NCAA-style box. Team Elo lives on Rankings."
      />
      {editor ? <StatsEditor sport={sport} rows={custom} /> : null}

      {spotlight.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {spotlight.map(({ col, player, value }) => (
            <Card key={col.key}>
              <p className="label-ui text-xs text-berkeley/50">{col.label} leader</p>
              <p className="mt-2 font-heading text-3xl">{formatStat(value, col.kind)}</p>
              <Link href={`/players/${player.id}`} className="mt-1 block font-medium hover:text-gold-dark">
                {player.name}
              </Link>
              <p className="text-sm text-berkeley/50">{getClass(player.classId)?.name}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {rows.length && cols.length ? (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-black/10 bg-berkeley text-paper">
              <tr>
                <th className="sticky left-0 bg-berkeley px-4 py-3">Player</th>
                <th className="px-4 py-3">Team</th>
                {cols.map((col) => (
                  <th key={col.key} className="px-3 py-3 text-right">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((player, i) => (
                <tr key={player.id} className="group border-b border-black/5 even:bg-paper/60">
                  <td className="sticky left-0 bg-white px-4 py-2.5 font-medium group-even:bg-[#f4efe6]">
                    <span className="mr-2 tabular-nums text-berkeley/40">{i + 1}</span>
                    <Link href={`/players/${player.id}`} className="hover:text-gold-dark">
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-berkeley/70">
                    <Link href={`/classes/${player.classId}`} className="hover:text-gold-dark">
                      {getClass(player.classId)?.name ?? player.classId}
                    </Link>
                  </td>
                  {cols.map((col) => {
                    const value = readStat(player.stats[sport], col);
                    const top = value !== undefined && value === maxima[col.key] && maxima[col.key] !== -Infinity;
                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-2.5 text-right tabular-nums ${top ? "font-semibold text-gold-dark" : ""}`}
                      >
                        {formatStat(value, col.kind)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {custom.length && !rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-berkeley text-paper">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {custom.map((row, i) => (
                <tr key={row.id} className="border-b border-black/5 even:bg-paper/60">
                  <td className="px-4 py-2.5 text-berkeley/40">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{row.name}</td>
                  <td className="px-4 py-2.5 uppercase tracking-wider text-berkeley/60">{row.label}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!rows.length && !custom.length ? (
        <Card>
          <p className="text-berkeley/60">No per-game stats yet. Editors can add leaders above, or attach numbers to players.</p>
        </Card>
      ) : null}
    </div>
  );
}
