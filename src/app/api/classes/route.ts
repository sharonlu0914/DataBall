import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { saveClass } from "@/lib/school-store";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const existingId = String(form.get("id") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const grade = Number(form.get("grade"));
  if (!name || !grade) return NextResponse.redirect(new URL("/classes", request.url), 303);
  const id = existingId || name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  saveClass({ id, name, grade });
  return NextResponse.redirect(new URL(`/classes/${id}`, request.url), 303);
}
