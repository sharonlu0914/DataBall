import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSport, sportLabel } from "@/lib/sports";
import { allClasses, getTeam, matchesForSport, teamsForSport } from "@/data/queries";
import { groupStandings } from "@/lib/league-store";
import { PageHeader } from "@/components/Ui";
import { BracketEditor, MatchBox } from "@/components/LeagueEditors";
import { isEditor } from "@/lib/auth";
import type { Match } from "@/lib/types";

type Props = { params: Promise<{ sport: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  return { title: isSport(sport) ? `${sportLabel(sport)} bracket` : "Bracket" };
}

function GroupPanel({
  sport,
  group,
  games,
}: {
  sport: Parameters<typeof groupStandings>[0];
  group: "A" | "B";
  games: Match[];
}) {
  const table = groupStandings(sport, group);
  return (
    <section className="space-y-4">
      <h2 className="label-ui text-[0.75rem] text-berkeley/50">Group {group}</h2>
      <div className="overflow-hidden rounded border border-black/15 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-berkeley text-paper">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">W</th>
              <th className="px-3 py-2">PD</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, index) => (
              <tr key={row.team.id} className="border-b border-black/5">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 font-medium">
                  <Link href={`/classes/${row.team.classId}`} className="hover:text-gold-dark">
                    {row.team.name.replace(/ Basketball| Soccer| Volleyball| Ultimate/, "")}
                  </Link>
                </td>
                <td className="px-3 py-2">{row.wins}</td>
                <td className="px-3 py-2">{row.pd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        {games.map((match) => (
          <MatchBox key={match.id} match={match} teamA={getTeam(match.teamAId)} teamB={getTeam(match.teamBId)} />
        ))}
      </div>
    </section>
  );
}

export default async function BracketPage({ params }: Props) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const games = matchesForSport(sport);
  const groupA = games.filter((m) => m.round === "Group A");
  const groupB = games.filter((m) => m.round === "Group B");
  const semis = games.filter((m) => m.round === "Semifinal");
  const final = games.find((m) => m.round === "Final");
  const editor = await isEditor();
  const teams = teamsForSport(sport);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker={sportLabel(sport)}
          title="Bracket"
          lede="Six teams, two groups, round-robin. Top two advance to the semifinals, then the championship. Team names open the class profile; scores open the match."
        />
        {editor ? (
          <div className="pt-8">
            <BracketEditor sport={sport} teams={teams} classes={allClasses()} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,1.1fr)_minmax(0,1fr)]">
        <GroupPanel sport={sport} group="A" games={groupA} />

        <section className="space-y-5">
          <p className="label-ui text-center text-[0.75rem] text-gold-dark">Knockout</p>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="space-y-3">
              <p className="text-center text-xs uppercase tracking-widest text-berkeley/45">Semifinal</p>
              {semis[0] ? (
                <MatchBox match={semis[0]} teamA={getTeam(semis[0].teamAId)} teamB={getTeam(semis[0].teamBId)} />
              ) : (
                <p className="text-center text-sm text-berkeley/50">A1 vs B2</p>
              )}
            </div>
            <div className="hidden h-px bg-black/20 sm:block sm:h-24 sm:w-px sm:justify-self-center" />
            <div className="space-y-3">
              <p className="text-center text-xs uppercase tracking-widest text-berkeley/45">Semifinal</p>
              {semis[1] ? (
                <MatchBox match={semis[1]} teamA={getTeam(semis[1].teamAId)} teamB={getTeam(semis[1].teamBId)} />
              ) : (
                <p className="text-center text-sm text-berkeley/50">B1 vs A2</p>
              )}
            </div>
          </div>
          <div className="mx-auto max-w-sm space-y-3 rounded-xl border-2 border-berkeley bg-white p-4">
            <p className="label-ui text-center text-[0.7rem] text-gold-dark">Championship</p>
            {final ? (
              <MatchBox match={final} teamA={getTeam(final.teamAId)} teamB={getTeam(final.teamBId)} />
            ) : (
              <p className="text-center text-sm text-berkeley/50">Finalists TBD</p>
            )}
            {final && final.scoreA !== null && final.scoreB !== null ? (
              <p className="text-center font-heading text-2xl">
                {(final.scoreA > final.scoreB ? getTeam(final.teamAId) : getTeam(final.teamBId))?.name}
              </p>
            ) : null}
          </div>
        </section>

        <GroupPanel sport={sport} group="B" games={groupB} />
      </div>
    </div>
  );
}
