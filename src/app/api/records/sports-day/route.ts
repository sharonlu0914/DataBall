import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { saveSportsDayRecord } from "@/lib/school-store";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const year = Number(form.get("year"));
  const event = String(form.get("event") ?? "").trim();
  const mark = String(form.get("mark") ?? "").trim();
  const holder = String(form.get("holder") ?? "").trim();
  if (!year || !event || !mark || !holder) {
    return NextResponse.redirect(new URL("/records/sports-day", request.url), 303);
  }
  saveSportsDayRecord({
    id: `sd-${Date.now()}`,
    year,
    event,
    mark,
    holder,
  });
  return NextResponse.redirect(new URL("/records/sports-day", request.url), 303);
}
