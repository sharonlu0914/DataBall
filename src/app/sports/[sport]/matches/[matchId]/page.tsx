import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { getMatch, getTeam, getPlayer, allPlayers } from "@/data/queries";
import { Card, PageHeader } from "@/components/Ui";
import { VideoEmbed } from "@/lib/media";
import { isEditor } from "@/lib/auth";
import { MatchEditor } from "@/components/LeagueEditors";

type Props = { params: Promise<{ sport: string; matchId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  const match = getMatch(matchId);
  return { title: match ? `${match.round}` : "Match" };
}

export default async function MatchPage({ params }: Props) {
  const { sport, matchId } = await params;
  if (!isSport(sport)) notFound();
  const match = getMatch(matchId);
  if (!match || match.sport !== sport) notFound();
  const a = getTeam(match.teamAId);
  const b = getTeam(match.teamBId);
  const editor = await isEditor();
  const players = allPlayers()
    .filter((p) => p.sports.includes(sport))
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        kicker={`${sportLabel(sport)} · ${match.round}`}
        title={`${a?.name ?? "Team"} vs ${b?.name ?? "Team"}`}
        lede={match.date}
      />
      <Card className="flex items-center justify-center gap-10 text-center">
        <div>
          <Link href={`/classes/${a?.classId}`} className="text-xl font-semibold hover:text-gold-dark">
            {a?.name}
          </Link>
          <p className="mt-2 text-4xl font-semibold">{match.scoreA ?? "–"}</p>
        </div>
        <p className="text-berkeley/40">vs</p>
        <div>
          <Link href={`/classes/${b?.classId}`} className="text-xl font-semibold hover:text-gold-dark">
            {b?.name}
          </Link>
          <p className="mt-2 text-4xl font-semibold">{match.scoreB ?? "–"}</p>
        </div>
      </Card>
      {match.notes ? <p className="max-w-2xl leading-7">{match.notes}</p> : null}
      {match.boxScore && match.boxScore.length > 0 ? (
        <Card>
          <h2 className="font-semibold">Match data</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {match.boxScore.map((row, i) => (
              <li key={`${row.playerId}-${i}`}>
                <Link href={`/players/${row.playerId}`} className="hover:underline">
                  {getPlayer(row.playerId)?.name}
                </Link>{" "}
                · {row.label} {row.value}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {match.videoUrl ? (
        <Card>
          <h2 className="font-semibold">Film</h2>
          <div className="mt-3">
            <VideoEmbed url={match.videoUrl} title={`${match.round} film`} />
          </div>
        </Card>
      ) : (
        <p className="text-sm text-berkeley/60">Video will appear here when the desk publishes it.</p>
      )}
      {editor ? <MatchEditor match={match} players={players} /> : null}
    </div>
  );
}
