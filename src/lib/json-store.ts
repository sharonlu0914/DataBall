import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export function readJsonFile<T>(relative: string, fallback: T): T {
  try {
    const raw = readFileSync(path.join(process.cwd(), relative), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonFile(relative: string, value: unknown) {
  const filePath = path.join(process.cwd(), relative);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2));
}
