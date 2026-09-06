import Link from "next/link";
import type { Metadata } from "next";
import { allClasses, playersInClass, teamsForClass } from "@/data/queries";
import { Card, PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { AddClassForm } from "@/components/EditorForms";

export const metadata: Metadata = { title: "Classes & Players" };

export default async function ClassesPage() {
  const klasses = allClasses();
  const editor = await isEditor();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="Classes & Players"
          title="Every homeroom"
          lede="A class is the unit across sports. Open a class for every player and every league they enter."
        />
        {editor ? (
          <div className="pt-8">
            <AddClassForm />
          </div>
        ) : null}
      </div>
      {klasses.length === 0 ? <p className="text-sm text-berkeley/60">No classes yet.</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {klasses.map((klass) => (
          <Card key={klass.id}>
            <h2 className="text-xl">
              <Link href={`/classes/${klass.id}`} className="hover:text-gold-dark">
                {klass.name}
              </Link>
            </h2>
            <p className="text-sm text-berkeley/60">Grade {klass.grade}</p>
            <p className="mt-2 text-sm">
              {playersInClass(klass.id).length} players · {teamsForClass(klass.id).length} teams
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
