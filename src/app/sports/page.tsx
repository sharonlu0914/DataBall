import Link from "next/link";
import type { Metadata } from "next";
import { SPORTS } from "@/lib/types";
import { sportMeta } from "@/lib/sports";
import { Card, PageHeader } from "@/components/Ui";

export const metadata: Metadata = { title: "Sports" };

export default function SportsIndexPage() {
  return (
    <div>
      <PageHeader
        kicker="Sports"
        title="Four leagues, one school"
        lede="Each sport has a bracket, Elo rankings, stats, class rosters, and championship history."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {SPORTS.map((sport) => (
          <Link key={sport} href={`/sports/${sport}`}>
            <Card className="h-full hover:-translate-y-0.5">
              <h2 className="text-2xl font-semibold">{sportMeta[sport].label}</h2>
              <p className="mt-2 text-sm text-berkeley/70">{sportMeta[sport].blurb}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
