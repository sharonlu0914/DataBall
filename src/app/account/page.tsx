import Link from "next/link";
import { PageHeader, Card } from "@/components/Ui";
import { displayName, editorEmails, getSession } from "@/lib/auth";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const session = await getSession();
  const signup = mode === "signup";
  const editors = editorEmails();

  return (
    <div>
      <PageHeader
        kicker="Profile"
        title="Account"
        lede="Sign in with your email. Listed editor addresses get extra controls on News, Recents, Records, and Classes."
      />

      {!session ? (
        <Card className="max-w-md">
          <div className="mb-4 flex gap-4 text-sm">
            <Link href="/account" className={!signup ? "font-semibold" : "text-berkeley/50"}>
              Log in
            </Link>
            <Link href="/account?mode=signup" className={signup ? "font-semibold" : "text-berkeley/50"}>
              Sign up
            </Link>
          </div>
          {error === "exists" ? <p className="mb-3 text-sm text-gold-dark">That email already has an account.</p> : null}
          {error === "1" ? <p className="mb-3 text-sm text-gold-dark">Check the email, password, or try again.</p> : null}
          {signup ? (
            <form action="/api/auth/signup" method="post" className="space-y-3">
              <input name="name" placeholder="Name" className="w-full rounded-lg border border-black/15 px-3 py-2" />
              <input name="email" type="email" placeholder="you@school.edu" className="w-full rounded-lg border border-black/15 px-3 py-2" required />
              <input name="password" type="password" minLength={6} placeholder="Password (6+ characters)" className="w-full rounded-lg border border-black/15 px-3 py-2" required />
              <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
                Create account
              </button>
            </form>
          ) : (
            <form action="/api/auth/login" method="post" className="space-y-3">
              <input type="hidden" name="next" value="/account" />
              <input name="email" type="email" placeholder="you@school.edu" className="w-full rounded-lg border border-black/15 px-3 py-2" required />
              <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-black/15 px-3 py-2" required />
              <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
                Sign in
              </button>
            </form>
          )}
          <p className="mt-4 text-xs leading-5 text-berkeley/50">
            Editor email: {editors.join(", ")}. Demo login password if you have not signed up: databall.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <p className="label-ui text-[0.7rem] text-gold-dark">{session.role === "editor" ? "Editor" : "Viewer"}</p>
            <h2 className="mt-2 capitalize">{displayName(session.email, session.name)}</h2>
            <p className="mt-1 text-sm text-berkeley/60">{session.email}</p>
            <form action="/api/auth/logout" method="post" className="mt-6">
              <button type="submit" className="text-sm text-berkeley/60 hover:underline">
                Sign out
              </button>
            </form>
          </Card>
          <Card>
            <h3>Shortcuts</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold-dark">
                  Home board
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gold-dark">
                  News
                </Link>
              </li>
              <li>
                <Link href="/classes" className="hover:text-gold-dark">
                  Classes
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
