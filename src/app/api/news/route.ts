import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { deleteNews, getNews, saveNewsPost } from "@/lib/news-store";
import type { NewsBlock, NewsPost } from "@/lib/types";

function isBlock(value: unknown): value is NewsBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as NewsBlock;
  if (block.type === "text") return typeof block.text === "string";
  if (block.type === "image" || block.type === "video") return typeof block.url === "string";
  return false;
}

function fromPayload(payload: {
  title?: string;
  excerpt?: string;
  blocks?: unknown[];
  slug?: string;
  date?: string;
}): NewsPost | null {
  const title = String(payload.title ?? "").trim();
  const blocks = (payload.blocks ?? []).filter(isBlock).map((block, index) => ({
    ...block,
    id: block.id || `b-${index}`,
  }));
  const text = blocks
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n\n")
    .trim();
  if (!title || (!text && blocks.length === 0)) return null;
  const excerpt = String(payload.excerpt ?? "").trim() || text.slice(0, 140);
  const slug =
    payload.slug?.trim() ||
    `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString().slice(-4)}`;
  return {
    slug,
    title,
    excerpt,
    body: text,
    blocks,
    date: payload.date || new Date().toISOString().slice(0, 10),
  };
}

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = fromPayload((await request.json()) as never);
  if (!post) return NextResponse.json({ error: "Title and body required" }, { status: 400 });
  saveNewsPost(post);
  return NextResponse.json({ slug: post.slug });
}

export async function PUT(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = (await request.json()) as { slug?: string; title?: string; excerpt?: string; blocks?: unknown[] };
  if (!payload.slug || !getNews(payload.slug)) {
    return NextResponse.json({ error: "Missing story" }, { status: 404 });
  }
  const existing = getNews(payload.slug)!;
  const post = fromPayload({ ...payload, date: existing.date, slug: existing.slug });
  if (!post) return NextResponse.json({ error: "Title and body required" }, { status: 400 });
  saveNewsPost(post);
  return NextResponse.json({ slug: post.slug });
}

export async function DELETE(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = (await request.json()) as { slug?: string };
  if (!payload.slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  deleteNews(payload.slug);
  return NextResponse.json({ ok: true });
}
