import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getClass, playersInClass, teamsForClass } from "@/data/queries";
import { sportLabel } from "@/lib/sports";
import { Card, PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { AddPlayerForm, EditClassForm } from "@/components/EditorForms";

type Props = { params: Promise<{ classId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params;
  return { title: getClass(classId)?.name ?? "Class" };
}

export default async function ClassPage({ params }: Props) {
  const { classId } = await params;
  const klass = getClass(classId);
  if (!klass) notFound();
  const roster = playersInClass(classId);
  const classTeams = teamsForClass(classId);
  const editor = await isEditor();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader kicker={`Grade ${klass.grade}`} title={klass.name} lede="Players across every league this class entered." />
        {editor ? (
          <div className="flex flex-col items-end gap-3 pt-8">
            <EditClassForm id={klass.id} name={klass.name} grade={klass.grade} />
            <AddPlayerForm classId={klass.id} />
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2>Players</h2>
          <ul className="mt-3 space-y-2">
            {roster.map((p) => (
              <li key={p.id}>
                <Link href={`/players/${p.id}`} className="hover:text-gold-dark">
                  {p.name}
                </Link>
                <span className="text-sm text-berkeley/50"> · {p.sports.map(sportLabel).join(", ")}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2>Teams</h2>
          <ul className="mt-3 space-y-2">
            {classTeams.map((t) => (
              <li key={t.id}>
                <Link href={`/teams/${t.id}`} className="hover:underline">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
