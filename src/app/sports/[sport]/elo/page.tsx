import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { allClasses, teamsForSport } from "@/data/queries";
import { PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { eloGamesFor, eloParamsFor } from "@/lib/elo-store";
import { EloBoard } from "@/components/EloBoard";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} Elo` : "Elo" };
}

export default async function EloPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const [editor, teams, classes] = await Promise.all([isEditor(), Promise.resolve(teamsForSport(sport)), Promise.resolve(allClasses())]);
  const games = eloGamesFor(sport);
  const eloParams = eloParamsFor(sport);

  return (
    <div>
      <PageHeader
        kicker={sportLabel(sport)}
        title="Elo"
        lede="One board. Log results in order; ratings update after every game. Click a team for its recent form."
      />
      <EloBoard sport={sport} teams={teams} classes={classes} games={games} params={eloParams} isEditor={editor} />
    </div>
  );
}
