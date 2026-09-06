"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsBlock, NewsPost } from "@/lib/types";

function nid() {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function fromPost(post?: NewsPost): NewsBlock[] {
  if (post?.blocks?.length) return post.blocks;
  if (post?.body) return [{ id: nid(), type: "text", text: post.body }];
  return [{ id: nid(), type: "text", text: "" }];
}

export function StoryComposer({
  post,
  triggerLabel = "Add story",
}: {
  post?: NewsPost;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(post) && triggerLabel === "Save");
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [blocks, setBlocks] = useState<NewsBlock[]>(fromPost(post));
  const [busy, setBusy] = useState(false);

  function update(id: string, patch: Partial<NewsBlock>) {
    setBlocks((list) => list.map((b) => (b.id === id ? ({ ...b, ...patch } as NewsBlock) : b)));
  }

  function insertAfter(id: string, type: NewsBlock["type"]) {
    const next: NewsBlock =
      type === "text"
        ? { id: nid(), type: "text", text: "" }
        : type === "image"
          ? { id: nid(), type: "image", url: "" }
          : { id: nid(), type: "video", url: "" };
    setBlocks((list) => {
      const i = list.findIndex((b) => b.id === id);
      const copy = [...list];
      copy.splice(i + 1, 0, next);
      return copy;
    });
  }

  async function upload(id: string, file: File) {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = (await res.json()) as { url?: string };
    if (json.url) update(id, { url: json.url } as Partial<NewsBlock>);
  }

  async function publish() {
    setBusy(true);
    const res = await fetch("/api/news", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, blocks, slug: post?.slug }),
    });
    setBusy(false);
    if (!res.ok) return;
    const json = (await res.json()) as { slug?: string };
    setOpen(false);
    router.push(json.slug ? `/news/${json.slug}` : "/news");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold"
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-xl border border-berkeley/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,50,98,0.06)]">
      <p className="label-ui text-[0.7rem] text-gold-dark">{post ? "Edit story" : "Compose"}</p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline"
        className="mt-3 w-full rounded-lg border border-black/15 px-3 py-2"
      />
      <input
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short dek"
        className="mt-3 w-full rounded-lg border border-black/15 px-3 py-2"
      />
      <div className="mt-4 space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="rounded-lg border border-black/10 p-3">
            {block.type === "text" ? (
              <textarea
                rows={5}
                value={block.text}
                onChange={(e) => update(block.id, { text: e.target.value })}
                placeholder="Write this section…"
                className="w-full rounded-md border border-black/10 px-3 py-2"
              />
            ) : null}
            {block.type === "image" ? (
              <div className="space-y-2">
                <input
                  value={block.url}
                  onChange={(e) => update(block.id, { url: e.target.value })}
                  placeholder="Image URL"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(block.id, e.target.files[0])} />
                {block.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.url} alt="" className="max-h-56 rounded-md object-cover" />
                ) : null}
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => update(block.id, { caption: e.target.value })}
                  placeholder="Caption"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {block.type === "video" ? (
              <div className="space-y-2">
                <input
                  value={block.url}
                  onChange={(e) => update(block.id, { url: e.target.value })}
                  placeholder="YouTube or video URL"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
                <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && upload(block.id, e.target.files[0])} />
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => update(block.id, { caption: e.target.value })}
                  placeholder="Caption"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <button type="button" className="hover:underline" onClick={() => insertAfter(block.id, "text")}>
                + Text
              </button>
              <button type="button" className="hover:underline" onClick={() => insertAfter(block.id, "image")}>
                + Image
              </button>
              <button type="button" className="hover:underline" onClick={() => insertAfter(block.id, "video")}>
                + Video
              </button>
              {blocks.length > 1 ? (
                <button
                  type="button"
                  className="text-gold-dark hover:underline"
                  onClick={() => setBlocks((list) => list.filter((b) => b.id !== block.id))}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void publish()}
          className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold"
        >
          {busy ? "Saving" : post ? "Save" : "Publish"}
        </button>
        <button type="button" className="text-sm text-berkeley/60 hover:underline" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AddStory() {
  return <StoryComposer />;
}

export function DeleteStory({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-gold-dark hover:underline"
      onClick={async () => {
        if (!confirm("Delete this story?")) return;
        await fetch("/api/news", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        router.push("/news");
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}
