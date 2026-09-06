import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "databall_session";

export type Role = "editor" | "viewer";

export type Session = {
  email: string;
  role: Role;
  name?: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || "scls-databall-dev-secret-change-me";
}

export function authPassword() {
  return process.env.AUTH_PASSWORD || process.env.ADMIN_PASSWORD || "databall";
}

export function editorEmails() {
  const raw =
    process.env.EDITOR_EMAILS || "sharonlu0914@gmail.com,202860116@stu.scls-sh.org";
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isEditorEmail(email: string) {
  return editorEmails().includes(email.trim().toLowerCase());
}

export function signSession(session: Session) {
  const body = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if (!parsed.email || (parsed.role !== "editor" && parsed.role !== "viewer")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSessionToken(token);
}

export async function isEditor() {
  const session = await getSession();
  return session?.role === "editor";
}

/** @deprecated use isEditor */
export async function isAdmin() {
  return isEditor();
}

export function displayName(email: string, name?: string) {
  if (name?.trim()) return name.trim();
  const local = email.split("@")[0] ?? email;
  return local.replace(/[._]/g, " ");
}
