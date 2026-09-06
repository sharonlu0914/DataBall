import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeam, getClass, getPlayer, allMatches, rankingFor } from "@/data/queries";
import { sportLabel } from "@/lib/sports";
import { Card, PageHeader } from "@/components/Ui";

type Props = { params: Promise<{ teamId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params;
  return { title: getTeam(teamId)?.name ?? "Team" };
}

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params;
  const team = getTeam(teamId);
  if (!team) notFound();
  const klass = getClass(team.classId);
  const rank = rankingFor(team.sport).find((r) => r.teamId === team.id);
  const teamMatches = allMatches().filter((m) => m.teamAId === team.id || m.teamBId === team.id);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={sportLabel(team.sport)}
        title={team.name}
        lede={`Class ${klass?.name ?? ""} · Elo ${rank?.elo ?? "—"}`}
      />
      <Card>
        <h2 className="font-semibold">Roster</h2>
        <ul className="mt-3 space-y-2">
          {team.playerIds.map((id) => (
            <li key={id}>
              <Link href={`/players/${id}`} className="hover:text-gold-dark">
                {getPlayer(id)?.name}
              </Link>
            </li>
          ))}
          {team.playerIds.length === 0 ? <li className="text-sm text-berkeley/50">Roster to be posted.</li> : null}
        </ul>
      </Card>
      <Card>
        <h2 className="font-semibold">Matches</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {teamMatches.map((m) => (
            <li key={m.id}>
              <Link href={`/sports/${m.sport}/matches/${m.id}`} className="hover:underline">
                {m.round}: {m.scoreA ?? "–"}–{m.scoreB ?? "–"}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-sm">
        <Link href={`/classes/${team.classId}`} className="text-berkeley hover:text-gold-dark hover:underline">
          Full class profile
        </Link>
      </p>
    </div>
  );
}
