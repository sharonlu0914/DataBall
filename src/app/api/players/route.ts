import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { savePlayer } from "@/lib/school-store";
import { isSport } from "@/lib/sports";
import type { Sport } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const existingId = String(form.get("id") ?? "").trim();
  const classId = String(form.get("classId") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const bio = String(form.get("bio") ?? "").trim();
  const sports = form
    .getAll("sports")
    .map(String)
    .filter(isSport) as Sport[];
  if (!classId || !name) {
    return NextResponse.redirect(new URL(`/classes/${classId || ""}`, request.url), 303);
  }
  const { getPlayer } = await import("@/data/queries");
  const previous = existingId ? getPlayer(existingId) : undefined;
  const id = existingId || `p-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
  savePlayer({
    id,
    name,
    classId,
    sports,
    bio,
    stats: previous?.stats ?? {},
  });
  return NextResponse.redirect(new URL(existingId ? `/players/${id}` : `/classes/${classId}`, request.url), 303);
}
