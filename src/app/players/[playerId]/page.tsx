import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlayer, getClass } from "@/data/queries";
import { sportLabel } from "@/lib/sports";
import { Card, PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { EditPlayerForm } from "@/components/LeagueEditors";

type Props = { params: Promise<{ playerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { playerId } = await params;
  return { title: getPlayer(playerId)?.name ?? "Player" };
}

export default async function PlayerPage({ params }: Props) {
  const { playerId } = await params;
  const player = getPlayer(playerId);
  if (!player) notFound();
  const klass = getClass(player.classId);

  const editor = await isEditor();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader kicker={klass?.name} title={player.name} lede={player.bio} />
        {editor ? (
          <div className="pt-8">
            <EditPlayerForm player={player} />
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {player.sports.map((sport) => (
          <Card key={sport}>
            <h2 className="font-semibold">{sportLabel(sport)}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(player.stats[sport] ?? {}).map(([k, v]) => (
                <div key={k}>
                  <dt className="uppercase tracking-widest text-berkeley/50">{k}</dt>
                  <dd className="text-2xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/sports/${sport}/players`} className="mt-4 inline-block text-sm text-berkeley hover:text-gold-dark hover:underline">
              League players
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
