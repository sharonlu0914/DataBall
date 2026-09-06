import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  authPassword,
  isEditorEmail,
  signSession,
} from "@/lib/auth";
import { findUser, hashPassword } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/account");

  if (!email.includes("@")) {
    return NextResponse.redirect(new URL("/account?error=1", request.url), 303);
  }

  const user = findUser(email);
  const ok = user ? user.passwordHash === hashPassword(password) : password === authPassword();
  if (!ok) {
    return NextResponse.redirect(new URL("/account?error=1", request.url), 303);
  }

  const session = {
    email,
    role: isEditorEmail(email) ? ("editor" as const) : ("viewer" as const),
    name: user?.name,
  };
  (await cookies()).set(SESSION_COOKIE, signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  const dest = next.startsWith("/") ? next : "/account";
  return NextResponse.redirect(new URL(dest, request.url), 303);
}
