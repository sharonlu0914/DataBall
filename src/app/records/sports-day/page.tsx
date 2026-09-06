import type { Metadata } from "next";
import { allSportsDayRecords } from "@/data/queries";
import { PageHeader } from "@/components/Ui";
import { isEditor } from "@/lib/auth";
import { AddSportsDay } from "@/components/EditorForms";

export const metadata: Metadata = { title: "Sports Day records" };

export default async function SportsDayRecordsPage() {
  const sportsDayRecords = allSportsDayRecords();
  const editor = await isEditor();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="Records"
          title="Sports Day"
          lede="School marks from the track, field, and house events."
        />
        {editor ? (
          <div className="pt-8">
            <AddSportsDay />
          </div>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-berkeley text-paper">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Mark</th>
              <th className="px-4 py-3">Athlete</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Year</th>
            </tr>
          </thead>
          <tbody>
            {sportsDayRecords.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-berkeley/55" colSpan={5}>
                  No records yet.
                </td>
              </tr>
            ) : (
              sportsDayRecords.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium">{row.event}</td>
                  <td className="px-4 py-3 font-heading text-lg">{row.mark}</td>
                  <td className="px-4 py-3">{row.holder}</td>
                  <td className="px-4 py-3">{row.className}</td>
                  <td className="px-4 py-3">{row.year}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
