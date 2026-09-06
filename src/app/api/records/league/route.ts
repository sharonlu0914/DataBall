import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { saveLeagueRecord } from "@/lib/school-store";
import { isSport } from "@/lib/sports";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const sport = String(form.get("sport") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const mark = String(form.get("mark") ?? "").trim();
  const holder = String(form.get("holder") ?? "").trim();
  const className = String(form.get("className") ?? "").trim();
  const year = Number(form.get("year"));
  const note = String(form.get("note") ?? "").trim();
  const imageUrl = String(form.get("imageUrl") ?? "").trim();
  const file = form.get("file");
  let photo = imageUrl;
  if (file instanceof File && file.size) {
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
    photo = `/uploads/${safe}`;
  }
  if (!isSport(sport) || !title || !mark || !holder || !className || !year) {
    return NextResponse.redirect(new URL("/records/league-hall", request.url), 303);
  }
  saveLeagueRecord({
    id: `lh-${Date.now()}`,
    sport,
    title,
    mark,
    holder,
    className,
    year,
    note: note || undefined,
    imageUrl: photo || undefined,
  });
  return NextResponse.redirect(new URL("/records/league-hall", request.url), 303);
}
