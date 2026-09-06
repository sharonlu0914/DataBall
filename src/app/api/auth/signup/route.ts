import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isEditorEmail, signSession } from "@/lib/auth";
import { findUser, hashPassword, saveUser } from "@/lib/users";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!email.includes("@") || password.length < 6) {
    return NextResponse.redirect(new URL("/account?mode=signup&error=1", request.url), 303);
  }
  if (findUser(email)) {
    return NextResponse.redirect(new URL("/account?mode=signup&error=exists", request.url), 303);
  }
  saveUser({ email, name: name || email.split("@")[0], passwordHash: hashPassword(password) });
  (await cookies()).set(
    SESSION_COOKIE,
    signSession({
      email,
      role: isEditorEmail(email) ? "editor" : "viewer",
      name: name || email.split("@")[0],
    }),
    { httpOnly: true, sameSite: "lax", path: "/" },
  );
  return NextResponse.redirect(new URL("/account", request.url), 303);
}
