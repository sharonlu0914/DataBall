"use client";

import { useEffect, useState } from "react";
import type { HomeWidget, HomeWidgetLink } from "@/lib/types";
import { MediaPicker } from "@/components/MediaPicker";

const defaultBracketLinks: HomeWidgetLink[] = [
  { href: "/sports/basketball/bracket", label: "Basketball" },
  { href: "/sports/soccer/bracket", label: "Soccer" },
  { href: "/sports/volleyball/bracket", label: "Volleyball" },
  { href: "/sports/ultimate/bracket", label: "Frisbee" },
];

function MatchPicker({
  selected,
  onChange,
  matches,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  matches: { id: string; label: string }[];
}) {
  return (
    <div>
      <p className="label-ui text-[0.65rem] text-berkeley/55">Matches</p>
      <p className="mt-1 text-xs text-berkeley/50">Leave empty to use today’s (or the next) slate.</p>
      {matches.length === 0 ? <p className="mt-2 text-xs text-berkeley/45">No matches logged yet.</p> : null}
      <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm">
        {matches.map((match) => {
          const checked = selected.includes(match.id);
          return (
            <li key={match.id}>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    onChange(
                      checked ? selected.filter((id) => id !== match.id) : [...selected, match.id],
                    );
                  }}
                />
                <span>{match.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TextField({
  label,
  value,
  onSave,
  rows,
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  rows?: number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const shared = "mt-1 w-full rounded-lg border border-berkeley/15 bg-white px-3 py-2 text-sm";
  return (
    <label className="block text-sm">
      <span className="label-ui text-[0.65rem] text-berkeley/55">{label}</span>
      {rows ? (
        <textarea
          className={shared}
          rows={rows}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft !== value) onSave(draft);
          }}
        />
      ) : (
        <input
          className={shared}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft !== value) onSave(draft);
          }}
        />
      )}
    </label>
  );
}

export function WidgetEditor({
  widget,
  posts,
  matches,
  onChange,
}: {
  widget: HomeWidget;
  posts: { slug: string; title: string; date: string }[];
  matches: { id: string; label: string }[];
  onChange: (patch: Partial<HomeWidget>) => void;
}) {
  const links = widget.links?.length ? widget.links : defaultBracketLinks;

  return (
    <div className="mb-3 space-y-3 rounded-xl border border-berkeley/10 bg-white p-4">
      <TextField label="Title" value={widget.title ?? ""} onSave={(title) => onChange({ title })} />
      <TextField label="Note" value={widget.note ?? ""} rows={2} onSave={(note) => onChange({ note })} />

      {widget.type === "elo" || widget.type === "schedule" || widget.type === "results" ? (
        <MatchPicker selected={widget.matchIds ?? []} matches={matches} onChange={(matchIds) => onChange({ matchIds })} />
      ) : null}

      {widget.type === "news" ? (
        <div>
          <p className="label-ui text-[0.65rem] text-berkeley/55">Stories</p>
          <p className="mt-1 text-xs text-berkeley/50">Leave empty to show the latest four.</p>
          <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm">
            {posts.map((post) => {
              const selected = widget.slugs ?? [];
              const checked = selected.includes(post.slug);
              return (
                <li key={post.slug}>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        onChange({
                          slugs: checked
                            ? selected.filter((slug) => slug !== post.slug)
                            : [...selected, post.slug],
                        });
                      }}
                    />
                    <span>
                      {post.title}{" "}
                      <span className="text-berkeley/45">{post.date}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {widget.type === "brackets" ? (
        <div className="space-y-2">
          <p className="label-ui text-[0.65rem] text-berkeley/55">Links</p>
          {links.map((link, index) => (
            <div key={`${link.href}-${index}`} className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded-lg border border-berkeley/15 px-3 py-2 text-sm"
                defaultValue={link.label}
                placeholder="Label"
                onBlur={(event) => {
                  const next = links.map((row, i) =>
                    i === index ? { ...row, label: event.target.value } : row,
                  );
                  onChange({ links: next });
                }}
              />
              <input
                className="rounded-lg border border-berkeley/15 px-3 py-2 text-sm"
                defaultValue={link.href}
                placeholder="/sports/basketball/bracket"
                onBlur={(event) => {
                  const next = links.map((row, i) =>
                    i === index ? { ...row, href: event.target.value } : row,
                  );
                  onChange({ links: next });
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-berkeley hover:underline"
            onClick={() => onChange({ links: [...links, { href: "/", label: "New link" }] })}
          >
            Add link
          </button>
        </div>
      ) : null}

      {widget.type === "note" ? (
        <>
          <TextField label="Body" value={widget.body ?? ""} rows={4} onSave={(body) => onChange({ body })} />
          <div>
            <p className="label-ui text-[0.65rem] text-berkeley/55">Photo</p>
            <div className="mt-1">
              <MediaPicker kind="image" value={widget.imageUrl} onChange={(imageUrl) => onChange({ imageUrl })} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
