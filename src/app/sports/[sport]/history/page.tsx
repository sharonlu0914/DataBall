import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { championshipsForSport, getTeam, teamsForSport } from "@/data/queries";
import { Card, PageHeader } from "@/components/Ui";
import { VideoEmbed } from "@/lib/media";
import { isEditor } from "@/lib/auth";
import { HistoryEditor } from "@/components/LeagueEditors";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} history` : "History" };
}

export default async function HistoryPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const rows = championshipsForSport(sport);
  const editor = await isEditor();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker={sportLabel(sport)}
          title="History"
          lede="Past championships — who lifted the league, who finished second, and the film when we have it."
        />
        {editor ? (
          <div className="pt-8">
            <HistoryEditor sport={sport} teams={teamsForSport(sport)} />
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={`${row.year}-${row.championTeamId}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-berkeley/50">{row.year}</p>
                <p className="text-lg font-semibold">
                  Champion:{" "}
                  <Link href={`/classes/${getTeam(row.championTeamId)?.classId}`} className="hover:text-gold-dark">
                    {getTeam(row.championTeamId)?.name}
                  </Link>
                </p>
                <p className="text-sm">
                  Runner-up:{" "}
                  <Link href={`/classes/${getTeam(row.runnerUpTeamId)?.classId}`} className="hover:underline">
                    {getTeam(row.runnerUpTeamId)?.name}
                  </Link>
                </p>
              </div>
            </div>
            {row.videoUrl ? (
              <div className="mt-4">
                <VideoEmbed url={row.videoUrl} title={`${row.year} championship`} />
              </div>
            ) : null}
          </Card>
        ))}
        {rows.length === 0 ? <p>No championships archived yet.</p> : null}
      </div>
    </div>
  );
}
