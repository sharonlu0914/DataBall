import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { teamsForSport, getClass, getPlayer, allClasses } from "@/data/queries";
import { Card, PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { BracketEditor } from "@/components/LeagueEditors";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} players` : "Players" };
}

export default async function SportPlayersPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const sportTeams = teamsForSport(sport);
  const editor = await isEditor();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker={sportLabel(sport)}
          title="Players and classes"
          lede="Each class is a team. Open a class for the roster; open a player for individual numbers."
        />
        {editor ? (
          <div className="pt-8">
            <BracketEditor sport={sport} teams={sportTeams} classes={allClasses()} />
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sportTeams.map((team) => (
          <Card key={team.id}>
            <h2 className="text-xl font-semibold">
              <Link href={`/classes/${team.classId}`} className="hover:text-gold-dark">
                {team.name}
              </Link>
            </h2>
            <p className="text-sm text-berkeley/60">{getClass(team.classId)?.name}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {team.playerIds.map((id) => {
                const player = getPlayer(id);
                return (
                  <li key={id}>
                    <Link href={`/players/${id}`} className="hover:underline">
                      {player?.name}
                    </Link>
                  </li>
                );
              })}
              {team.playerIds.length === 0 ? (
                <li className="text-berkeley/50">Roster to be posted.</li>
              ) : null}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-berkeley/60">
        Looking for every class across sports? See the school-wide{" "}
        <Link href="/classes" className="text-berkeley hover:text-gold-dark hover:underline">
          Classes
        </Link>{" "}
        index. All-around rankings stay on this sport&apos;s stats page.
      </p>
    </div>
  );
}
