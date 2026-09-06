import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isEditor } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const ext = path.extname(file.name || "").toLowerCase() || ".bin";
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${safe}` });
}
