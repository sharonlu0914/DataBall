import Link from "next/link";
import { Card } from "@/components/Ui";
import type { HomeMatchCard, HomeWidget, HomeWidgetLink } from "@/lib/types";
import { sportLabel } from "@/lib/sports";

function picked(ids: string[] | undefined, all: HomeMatchCard[]) {
  if (!ids?.length) return null;
  return ids.flatMap((id) => {
    const match = all.find((m) => m.id === id);
    return match ? [match] : [];
  });
}

function NoteLine({ note }: { note?: string }) {
  if (!note?.trim()) return null;
  return <p className="mb-3 text-sm leading-6 text-berkeley/70">{note}</p>;
}

function EloBar({ match }: { match: HomeMatchCard }) {
  const pctA = Math.round(match.pctA * 1000) / 10;
  const pctB = Math.round(match.pctB * 1000) / 10;
  return (
    <div className="mt-3 space-y-1.5">
      <p className="label-ui text-[0.65rem] text-berkeley/45">Elo prediction</p>
      <div className="flex h-2 overflow-hidden rounded-full">
        <div className="bg-berkeley" style={{ width: `${pctA}%` }} />
        <div className="bg-gold" style={{ width: `${pctB}%` }} />
      </div>
      <div className="flex justify-between text-xs text-berkeley/65">
        <span>
          {match.teamAName} {pctA}%
        </span>
        <span>
          {match.teamBName} {pctB}%
        </span>
      </div>
    </div>
  );
}

export function ScheduleWidget({
  widget,
  slate,
  matches,
}: {
  widget: HomeWidget;
  slate: { heading: string; date: string; games: HomeMatchCard[] };
  matches: HomeMatchCard[];
}) {
  const games = picked(widget.matchIds, matches) ?? slate.games;
  return (
    <Card>
      <NoteLine note={widget.note} />
      <p className="text-xs uppercase tracking-widest text-berkeley/50">{slate.date}</p>
      {games.length === 0 ? (
        <p className="mt-3 text-sm text-berkeley/55">No games on the slate yet.</p>
      ) : (
        <ul className="mt-3 space-y-5">
          {games.map((match) => {
            const played = match.scoreA !== null && match.scoreB !== null;
            return (
              <li key={match.id}>
                <Link href={`/sports/${match.sport}/matches/${match.id}`} className="hover:text-gold-dark">
                  <span className="text-xs uppercase tracking-widest text-berkeley/45">
                    {sportLabel(match.sport)} · {match.round}
                  </span>
                  <p className="font-heading text-lg">
                    {match.teamAName} {played ? `${match.scoreA}–${match.scoreB}` : "vs"} {match.teamBName}
                  </p>
                </Link>
                <EloBar match={match} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function NewsWidget({
  widget,
  posts,
}: {
  widget: HomeWidget;
  posts: { slug: string; title: string; date: string }[];
}) {
  const selected = widget.slugs?.length
    ? widget.slugs.flatMap((slug) => {
        const post = posts.find((p) => p.slug === slug);
        return post ? [post] : [];
      })
    : posts.slice(0, 4);
  return (
    <Card>
      <NoteLine note={widget.note} />
      {selected.length === 0 ? <p className="text-sm text-berkeley/55">No stories yet.</p> : null}
      <ul className="space-y-3">
        {selected.map((post) => (
          <li key={post.slug}>
            <Link href={`/news/${post.slug}`} className="font-medium hover:text-gold-dark">
              {post.title}
            </Link>
            <p className="text-sm text-berkeley/50">{post.date}</p>
          </li>
        ))}
      </ul>
      <Link href="/news" className="mt-4 inline-block text-sm text-berkeley hover:text-gold-dark hover:underline">
        All news
      </Link>
    </Card>
  );
}

export function ResultsWidget({ widget, matches }: { widget: HomeWidget; matches: HomeMatchCard[] }) {
  const played = matches.filter((m) => m.scoreA !== null).slice(0, 6);
  const list = picked(widget.matchIds, matches) ?? played;
  return (
    <Card>
      <NoteLine note={widget.note} />
      {list.length === 0 ? <p className="text-sm text-berkeley/55">No final scores yet.</p> : null}
      <ul className="space-y-2 text-sm">
        {list.map((m) => (
          <li key={m.id}>
            <Link href={`/sports/${m.sport}/matches/${m.id}`} className="hover:underline">
              {m.teamAName} {m.scoreA ?? "–"}–{m.scoreB ?? "–"} {m.teamBName}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const defaultBracketLinks: HomeWidgetLink[] = [
  { href: "/sports/basketball/bracket", label: "Basketball" },
  { href: "/sports/soccer/bracket", label: "Soccer" },
  { href: "/sports/volleyball/bracket", label: "Volleyball" },
  { href: "/sports/ultimate/bracket", label: "Frisbee" },
];

export function BracketsWidget({ widget }: { widget: HomeWidget }) {
  const links = widget.links?.length ? widget.links : defaultBracketLinks;
  return (
    <Card>
      <NoteLine note={widget.note} />
      <p className="text-sm text-berkeley/70">Jump into the active knockout boards.</p>
      <div className="mt-3 flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <Link key={link.href} className="text-berkeley hover:text-gold-dark hover:underline" href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function NoteWidget({ widget }: { widget: HomeWidget }) {
  return (
    <Card>
      {widget.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={widget.imageUrl} alt="" className="mb-4 max-h-64 w-full rounded-lg object-cover" />
      ) : null}
      <NoteLine note={widget.note} />
      {widget.body ? <p className="whitespace-pre-wrap text-sm leading-6 text-berkeley/80">{widget.body}</p> : null}
    </Card>
  );
}
