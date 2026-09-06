import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel, sportMeta } from "@/lib/sports";
import { matchesForSport, newsForSport, getTeam, teamsForSport } from "@/data/queries";
import { eloGamesFor, eloParamsFor } from "@/lib/elo-store";
import { computeElo } from "@/lib/elo";
import { Card, PageHeader } from "@/components/Ui";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  if (!isSport(sport)) return { title: "Sport" };
  return { title: sportLabel(sport) };
}

export default async function SportOverviewPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const teams = teamsForSport(sport);
  const table = computeElo(eloGamesFor(sport), eloParamsFor(sport), teams).board.slice(0, 3);
  const latest = matchesForSport(sport)[0];
  const posts = newsForSport(sport);

  return (
    <div className="space-y-8">
      <PageHeader kicker="League" title={sportLabel(sport)} lede={sportMeta[sport].blurb} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Top Elo</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {table.map((row, i) => (
              <li key={row.teamId}>
                {i + 1}. {getTeam(row.teamId)?.name} · {row.elo}
              </li>
            ))}
          </ol>
          <Link href={`/sports/${sport}/elo`} className="mt-3 inline-block text-sm text-berkeley hover:text-gold-dark hover:underline">
            Elo board
          </Link>
        </Card>
        <Card>
          <h2 className="font-semibold">Latest match</h2>
          {latest ? (
            <p className="mt-3 text-sm">
              <Link href={`/sports/${sport}/matches/${latest.id}`} className="hover:underline">
                {getTeam(latest.teamAId)?.name} {latest.scoreA ?? "–"} {latest.scoreB ?? "–"}{" "}
                {getTeam(latest.teamBId)?.name}
              </Link>
            </p>
          ) : (
            <p className="mt-3 text-sm text-berkeley/60">No matches logged yet.</p>
          )}
          <Link href={`/sports/${sport}/bracket`} className="mt-3 inline-block text-sm text-berkeley hover:text-gold-dark hover:underline">
            Bracket
          </Link>
        </Card>
        <Card>
          <h2 className="font-semibold">League notes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/news/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
            {posts.length === 0 ? <li>No sport-specific notes yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
