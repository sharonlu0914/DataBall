import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { HomeWidget } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "board.json");

export const defaultBoard: HomeWidget[] = [];

export async function readBoard(): Promise<HomeWidget[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as HomeWidget[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* use defaults */
  }
  return defaultBoard;
}

export async function writeBoard(widgets: HomeWidget[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(widgets, null, 2));
}
