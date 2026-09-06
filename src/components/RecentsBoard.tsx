"use client";

import { useState } from "react";
import type { HomeMatchCard, HomeWidget, HomeWidgetType } from "@/lib/types";
import { widgetCatalog } from "@/lib/widget-catalog";
import { WidgetEditor } from "@/components/WidgetEditor";
import {
  BracketsWidget,
  NewsWidget,
  NoteWidget,
  ResultsWidget,
  ScheduleWidget,
} from "@/components/RecentsWidgets";

function defaultTitle(widget: HomeWidget, slateHeading: string) {
  if (widget.title?.trim()) return widget.title;
  if (widget.type === "schedule" || widget.type === "elo") return slateHeading;
  return widgetCatalog.find((item) => item.type === widget.type)?.label ?? widget.type;
}

function WidgetBody({
  widget,
  posts,
  slate,
  matches,
}: {
  widget: HomeWidget;
  posts: { slug: string; title: string; date: string }[];
  slate: { heading: string; date: string; games: HomeMatchCard[] };
  matches: HomeMatchCard[];
}) {
  switch (widget.type) {
    case "elo":
    case "schedule":
      return <ScheduleWidget widget={widget} slate={slate} matches={matches} />;
    case "news":
      return <NewsWidget widget={widget} posts={posts} />;
    case "results":
      return <ResultsWidget widget={widget} matches={matches} />;
    case "brackets":
      return <BracketsWidget widget={widget} />;
    case "note":
      return <NoteWidget widget={widget} />;
  }
}

export function RecentsBoard({
  widgets: initial,
  posts,
  isEditor,
  slate,
  matches,
}: {
  widgets: HomeWidget[];
  posts: { slug: string; title: string; date: string }[];
  isEditor: boolean;
  slate: { heading: string; date: string; games: HomeMatchCard[] };
  matches: HomeMatchCard[];
}) {
  const [widgets, setWidgets] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const matchLabels = matches.map((match) => ({
    id: match.id,
    label: `${match.sport} · ${match.teamAName} vs ${match.teamBName} (${match.date})`,
  }));

  async function persist(next: HomeWidget[]) {
    setWidgets(next);
    setSaving(true);
    await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets: next }),
    });
    setSaving(false);
  }

  function move(fromId: string, toId: string) {
    if (fromId === toId) return;
    const next = [...widgets];
    const from = next.findIndex((w) => w.id === fromId);
    const to = next.findIndex((w) => w.id === toId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    void persist(next);
  }

  function remove(id: string) {
    void persist(widgets.filter((w) => w.id !== id));
  }

  function add(type: HomeWidgetType) {
    void persist([...widgets, { id: `${type}-${Date.now().toString().slice(-6)}`, type, size: "wide" }]);
    setPicker(false);
  }

  function setSize(id: string, size: "wide" | "square") {
    void persist(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
  }

  function patch(id: string, next: Partial<HomeWidget>) {
    void persist(widgets.map((w) => (w.id === id ? { ...w, ...next } : w)));
  }

  return (
    <section className="space-y-8">
      {isEditor ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold"
            onClick={() => {
              setEditing((v) => !v);
              setPicker(false);
            }}
          >
            {editing ? (saving ? "Saving" : "Done") : "Edit board"}
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative ${widget.size === "square" ? "" : "md:col-span-2"}`}
            draggable={editing}
            onDragStart={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("input, textarea, button, label, a")) {
                event.preventDefault();
                return;
              }
              setDragId(widget.id);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, widget.id);
              setDragId(null);
            }}
          >
            {editing ? (
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Remove widget"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-berkeley text-lg leading-none text-gold"
                  onClick={() => remove(widget.id)}
                >
                  −
                </button>
                <button
                  type="button"
                  className={`label-ui rounded-full px-3 py-1 text-[0.65rem] ${widget.size === "square" ? "bg-berkeley text-gold" : "border border-berkeley/20"}`}
                  onClick={() => setSize(widget.id, "square")}
                >
                  Square
                </button>
                <button
                  type="button"
                  className={`label-ui rounded-full px-3 py-1 text-[0.65rem] ${widget.size !== "square" ? "bg-berkeley text-gold" : "border border-berkeley/20"}`}
                  onClick={() => setSize(widget.id, "wide")}
                >
                  Wide
                </button>
              </div>
            ) : null}
            {editing ? (
              <WidgetEditor
                widget={widget}
                posts={posts}
                matches={matchLabels}
                onChange={(next) => patch(widget.id, next)}
              />
            ) : null}
            <h3 className="font-heading mb-3 text-lg">{defaultTitle(widget, slate.heading)}</h3>
            <WidgetBody widget={widget} posts={posts} slate={slate} matches={matches} />
          </div>
        ))}
        {editing ? (
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setPicker((v) => !v)}
              className="flex min-h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-berkeley/25 bg-white/60 text-berkeley hover:border-gold"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="label-ui mt-2 text-[0.7rem]">Add widget</span>
            </button>
            {picker ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {widgetCatalog.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    className="rounded-xl border border-berkeley/10 bg-white p-4 text-left hover:border-gold"
                    onClick={() => add(item.type)}
                  >
                    <p className="font-heading">{item.label}</p>
                    <p className="mt-1 text-sm text-berkeley/60">{item.hint}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
