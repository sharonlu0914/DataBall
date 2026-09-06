"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { inboxMessages } from "@/lib/inbox";

const inboxPreview = inboxMessages;

const sportsItems = [
  { href: "/sports/basketball", label: "Basketball" },
  { href: "/sports/soccer", label: "Soccer" },
  { href: "/sports/volleyball", label: "Volleyball" },
  { href: "/sports/ultimate", label: "Frisbee" },
];

const recordsItems = [
  { href: "/records/sports-day", label: "Sports Day" },
  { href: "/records/league-hall", label: "League Hall" },
];

const navClass =
  "label-ui text-[0.8rem] text-white/85 hover:text-gold";
const navActive = "label-ui text-[0.8rem] text-gold";

function IconMessages({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v7.5a2.25 2.25 0 0 1-2.25 2.25H9.2L5.4 19.7a.75.75 0 0 1-1.15-.63V6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAccount({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.25c.9-3.1 3.4-4.75 6.5-4.75s5.6 1.65 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Dropdown({
  label,
  items,
  active,
  onNavigate,
}: {
  label: string;
  items: { href: string; label: string }[];
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="group relative">
      <span className={`${active ? navActive : navClass} inline-flex cursor-default items-center gap-1 py-2`}>
        {label}
        <span aria-hidden="true" className="text-[0.65rem]">
          ▾
        </span>
      </span>
      <div className="flex flex-col gap-2 pl-3 md:absolute md:left-0 md:top-full md:z-50 md:hidden md:min-w-[13rem] md:border md:border-gold/25 md:bg-berkeley md:p-3 md:pl-3 md:shadow-lg md:group-hover:flex md:group-focus-within:flex">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`${navClass} py-1`} onClick={onNavigate}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader({
  email,
  role,
  name,
}: {
  email?: string;
  role?: "editor" | "viewer";
  name?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sportsOpen = pathname.startsWith("/sports") || pathname.startsWith("/teams");
  const recordsOpen = pathname.startsWith("/records");
  const classesOpen = pathname.startsWith("/classes") || pathname.startsWith("/players");
  const pretty = name || (email ? email.split("@")[0] : "");
  const accountLabel = role === "editor" ? "Editor" : email ? pretty : "Sign in";
  const initial = (pretty || "?").slice(0, 1).toUpperCase();

  return (
    <header className="sticky relative top-0 z-40 border-b border-gold/25 bg-berkeley text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-[1.65rem] text-gold md:text-[1.85rem]" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <nav
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-2 border-b border-gold/20 bg-berkeley p-4 md:static md:flex md:flex-1 md:flex-row md:items-center md:justify-center md:gap-7 md:border-0 md:bg-transparent md:p-0`}
        >
          <Link
            href="/news"
            className={pathname.startsWith("/news") ? navActive : navClass}
            onClick={() => setOpen(false)}
          >
            News
          </Link>
          <Dropdown label="Records" items={recordsItems} active={recordsOpen} onNavigate={() => setOpen(false)} />
          <Dropdown label="Sports" items={sportsItems} active={sportsOpen} onNavigate={() => setOpen(false)} />
          <Link
            href="/classes"
            className={classesOpen ? navActive : navClass}
            onClick={() => setOpen(false)}
          >
            Classes & Players
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <div className="group relative">
            <Link
              href="/messages"
              className={`relative flex rounded-full p-2 ${pathname.startsWith("/messages") ? "text-gold" : "text-white/90 hover:bg-white/10 hover:text-gold"}`}
              aria-label="Messages"
            >
              <IconMessages className="h-5 w-5" />
              {inboxMessages.length ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
              ) : null}
            </Link>
            <div className="invisible absolute right-0 top-full z-50 w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-xl border border-black/10 bg-white text-berkeley shadow-xl">
                <p className="label-ui border-b border-black/5 px-3 py-2 text-[0.65rem] text-berkeley/45">Messages</p>
                <ul>
                  {inboxPreview.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-berkeley/55">No messages yet.</li>
                  ) : null}
                  {inboxPreview.map((item) => (
                    <li key={item.id} className="border-b border-black/5 last:border-0">
                      <Link href="/messages" className="block px-3 py-2 hover:bg-paper">
                        <p className="text-sm font-semibold leading-5">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-berkeley/55">{item.body}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/messages" className="block px-3 py-2 text-center text-xs text-berkeley/60 hover:bg-paper">
                  Open inbox
                </Link>
              </div>
            </div>
          </div>
          <div className="group relative">
            <Link
              href="/account"
              className={`flex items-center gap-2 rounded-full p-2 ${pathname.startsWith("/account") ? "text-gold" : "text-white/90 hover:bg-white/10 hover:text-gold"}`}
              aria-label="Account"
            >
              <IconAccount className="h-5 w-5" />
              <span className="label-ui hidden text-[0.75rem] md:inline">{accountLabel}</span>
            </Link>
            <div className="invisible absolute right-0 top-full z-50 w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-xl border border-black/10 bg-white p-4 text-berkeley shadow-xl">
                {email ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-berkeley font-heading text-lg text-gold">
                        {initial}
                      </div>
                      <div>
                        <p className="font-heading text-lg capitalize leading-6">{pretty}</p>
                        <p className="text-xs text-berkeley/50">{email}</p>
                      </div>
                    </div>
                    <p className="label-ui mt-3 text-[0.65rem] text-gold-dark">{role === "editor" ? "Editor" : "Viewer"}</p>
                    <Link href="/account" className="mt-3 block text-sm hover:text-gold-dark">
                      Open profile
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-heading text-lg">Sign in</p>
                    <p className="mt-1 text-sm text-berkeley/60">Log in or create an account to follow leagues and messages.</p>
                    <div className="mt-3 flex gap-2 text-sm">
                      <Link href="/account" className="rounded-full bg-berkeley px-3 py-1 text-gold">
                        Log in
                      </Link>
                      <Link href="/account?mode=signup" className="rounded-full border border-berkeley/20 px-3 py-1">
                        Sign up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="rounded border border-gold/40 px-3 py-1 text-[0.8rem] text-gold label-ui md:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-berkeley text-white/65">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <p>
          <span className="text-gold">DataBall</span> — school sports analytics and media.
        </p>
      </div>
    </footer>
  );
}
