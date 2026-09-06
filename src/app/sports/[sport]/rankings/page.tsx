import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { rankingFor, getTeam, teamsForSport } from "@/data/queries";
import { PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { RankingsEditor } from "@/components/LeagueEditors";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} rankings` : "Rankings" };
}

export default async function RankingsPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const rows = rankingFor(sport);
  const editor = await isEditor();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={sportLabel(sport)}
        title="Rankings"
        lede="Class teams ordered by Elo. Wins, losses, and point differential sit beside the rating."
      />
      {editor ? <RankingsEditor sport={sport} rows={rows} teams={teamsForSport(sport)} /> : null}
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-berkeley text-paper">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">W–L</th>
              <th className="px-4 py-3">PF</th>
              <th className="px-4 py-3">PA</th>
              <th className="px-4 py-3">Elo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const team = getTeam(row.teamId);
              return (
                <tr key={row.teamId} className="border-b border-black/5">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/classes/${team?.classId}`} className="hover:text-gold-dark">
                      {team?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.wins}–{row.losses}
                  </td>
                  <td className="px-4 py-3">{row.pointsFor}</td>
                  <td className="px-4 py-3">{row.pointsAgainst}</td>
                  <td className="px-4 py-3 font-semibold">{row.elo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
