import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { readBoard, writeBoard } from "@/lib/board-store";
import { HOME_WIDGET_TYPES, type HomeWidget, type HomeWidgetType } from "@/lib/types";

function isType(value: string): value is HomeWidgetType {
  return (HOME_WIDGET_TYPES as readonly string[]).includes(value);
}

function sanitizeWidget(item: unknown): HomeWidget | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.type !== "string" || !isType(raw.type)) return null;
  const widget: HomeWidget = { id: raw.id, type: raw.type };
  if (raw.size === "wide" || raw.size === "square") widget.size = raw.size;
  if (typeof raw.title === "string") widget.title = raw.title.slice(0, 80);
  if (typeof raw.note === "string") widget.note = raw.note.slice(0, 2000);
  if (typeof raw.body === "string") widget.body = raw.body.slice(0, 8000);
  if (typeof raw.imageUrl === "string") widget.imageUrl = raw.imageUrl.slice(0, 500);
  if (Array.isArray(raw.matchIds)) {
    widget.matchIds = raw.matchIds.filter((id): id is string => typeof id === "string").slice(0, 24);
  }
  if (Array.isArray(raw.slugs)) {
    widget.slugs = raw.slugs.filter((id): id is string => typeof id === "string").slice(0, 24);
  }
  if (Array.isArray(raw.links)) {
    widget.links = raw.links
      .flatMap((link) => {
        if (!link || typeof link !== "object") return [];
        const row = link as { href?: unknown; label?: unknown };
        if (typeof row.href !== "string" || typeof row.label !== "string") return [];
        return [{ href: row.href.slice(0, 200), label: row.label.slice(0, 80) }];
      })
      .slice(0, 12);
  }
  return widget;
}

export async function GET() {
  return NextResponse.json({ widgets: await readBoard() });
}

export async function POST(request: Request) {
  if (!(await isEditor())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { widgets?: unknown };
  if (!Array.isArray(body.widgets)) {
    return NextResponse.json({ error: "Invalid board" }, { status: 400 });
  }
  const widgets = body.widgets.flatMap((item) => {
    const widget = sanitizeWidget(item);
    return widget ? [widget] : [];
  });
  await writeBoard(widgets);
  return NextResponse.json({ widgets });
}
