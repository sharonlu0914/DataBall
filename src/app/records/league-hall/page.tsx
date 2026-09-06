import type { Metadata } from "next";
import { allLeagueRecords } from "@/data/queries";
import { Card, PageHeader } from "@/components/Ui";
import { sportLabel } from "@/lib/sports";
import { isEditor } from "@/lib/auth";
import { AddLeagueHall } from "@/components/EditorForms";

export const metadata: Metadata = { title: "League hall" };

export default async function LeagueHallPage() {
  const leagueRecords = allLeagueRecords();
  const editor = await isEditor();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="Records"
          title="League hall"
          lede="Single-game scoring, hat-tricks, and the rest of the school lore."
        />
        {editor ? (
          <div className="pt-8">
            <AddLeagueHall />
          </div>
        ) : null}
      </div>
      {leagueRecords.length === 0 ? <p className="text-sm text-berkeley/60">No records yet.</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {leagueRecords.map((r) => (
          <Card key={r.id}>
            {r.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.imageUrl} alt="" className="mb-3 max-h-48 w-full rounded-lg object-cover" />
            ) : null}
            <p className="text-xs uppercase tracking-widest text-gold-dark">{sportLabel(r.sport)}</p>
            <h2 className="mt-2 font-semibold">{r.title}</h2>
            <p className="font-heading mt-1 text-2xl">{r.mark}</p>
            <p className="text-sm text-berkeley/70">
              {r.holder} · {r.className} · {r.year}
              {r.note ? ` · ${r.note}` : ""}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
