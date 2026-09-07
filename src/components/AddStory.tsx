"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsBlock, NewsPost } from "@/lib/types";
import { MediaPicker, uploadMedia } from "@/components/MediaPicker";

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
  const [coverUrl, setCoverUrl] = useState(post?.coverUrl ?? "");
  const [blocks, setBlocks] = useState<NewsBlock[]>(fromPost(post));
  const [busy, setBusy] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const focusedId = useRef<string | null>(null);
  const caret = useRef(0);
  const textareas = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const imagePick = useRef<HTMLInputElement>(null);
  const videoPick = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<"image" | "video">("image");

  function update(id: string, patch: Partial<NewsBlock>) {
    setBlocks((list) => list.map((b) => (b.id === id ? ({ ...b, ...patch } as NewsBlock) : b)));
  }

  function rememberCaret(id: string) {
    focusedId.current = id;
    const node = textareas.current[id];
    if (node) caret.current = node.selectionStart ?? node.value.length;
  }

  function insertMedia(url: string, type: "image" | "video") {
    const media: NewsBlock = { id: nid(), type, url };
    setBlocks((list) => {
      const id = focusedId.current ?? list[list.length - 1]?.id;
      const i = list.findIndex((b) => b.id === id);
      if (i < 0) return [...list, media, { id: nid(), type: "text", text: "" }];
      const current = list[i];
      if (current.type !== "text") {
        const copy = [...list];
        copy.splice(i + 1, 0, media, { id: nid(), type: "text", text: "" });
        return copy;
      }
      const at = Math.min(caret.current, current.text.length);
      const before = current.text.slice(0, at).replace(/\s+$/, "");
      const after = current.text.slice(at).replace(/^\s+/, "");
      const next: NewsBlock[] = [];
      if (before) next.push({ ...current, text: before });
      next.push(media);
      next.push({ id: nid(), type: "text", text: after });
      const copy = [...list];
      copy.splice(i, 1, ...next);
      return copy;
    });
  }

  async function onPicked(file: File | undefined) {
    if (!file) return;
    setMediaError("");
    try {
      insertMedia(await uploadMedia(file), pendingKind.current);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function pick(kind: "image" | "video") {
    pendingKind.current = kind;
    if (kind === "image") imagePick.current?.click();
    else videoPick.current?.click();
  }

  async function publish() {
    setBusy(true);
    const res = await fetch("/api/news", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, coverUrl, blocks, slug: post?.slug }),
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
        ref={imagePick}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onPicked(file);
        }}
      />
      <input
        ref={videoPick}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onPicked(file);
        }}
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Headline"
        className="mt-3 w-full rounded-lg border border-black/15 px-3 py-2"
      />
      <input
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short dek (optional)"
        className="mt-3 w-full rounded-lg border border-black/15 px-3 py-2"
      />

      <div className="mt-4 rounded-lg border border-dashed border-berkeley/20 p-3">
        <p className="label-ui text-[0.65rem] text-berkeley/55">Cover photo</p>
        <p className="mt-1 text-xs text-berkeley/45">Optional. Skip this for a text-only story.</p>
        <div className="mt-2">
          <MediaPicker kind="image" value={coverUrl} onChange={setCoverUrl} />
        </div>
        {coverUrl ? (
          <button type="button" className="mt-2 text-xs text-gold-dark hover:underline" onClick={() => setCoverUrl("")}>
            Remove cover
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="label-ui text-[0.65rem] text-berkeley/55">Body</p>
        <button type="button" className="text-xs text-berkeley hover:underline" onClick={() => pick("image")}>
          Insert image
        </button>
        <button type="button" className="text-xs text-berkeley hover:underline" onClick={() => pick("video")}>
          Insert video
        </button>
      </div>
      <p className="mt-1 text-xs text-berkeley/45">
        Click in the text first, then insert — the photo goes at the cursor.
      </p>
      {mediaError ? <p className="mt-2 text-sm text-gold-dark">{mediaError}</p> : null}

      <div className="mt-3 space-y-3">
        {blocks.map((block) => (
          <div key={block.id}>
            {block.type === "text" ? (
              <textarea
                ref={(node) => {
                  textareas.current[block.id] = node;
                }}
                rows={Math.max(4, block.text.split("\n").length + 1)}
                value={block.text}
                onChange={(e) => update(block.id, { text: e.target.value })}
                onSelect={() => rememberCaret(block.id)}
                onClick={() => rememberCaret(block.id)}
                onKeyUp={() => rememberCaret(block.id)}
                placeholder="Write here…"
                className="w-full rounded-md border border-black/10 px-3 py-2 leading-7"
              />
            ) : null}
            {block.type === "image" ? (
              <div className="space-y-2 rounded-lg bg-paper/80 p-3">
                <MediaPicker kind="image" value={block.url} onChange={(url) => update(block.id, { url })} />
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => update(block.id, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {block.type === "video" ? (
              <div className="space-y-2 rounded-lg bg-paper/80 p-3">
                <MediaPicker kind="video" value={block.url} onChange={(url) => update(block.id, { url })} />
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => update(block.id, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {block.type !== "text" || blocks.length > 1 ? (
              <button
                type="button"
                className="mt-1 text-xs text-gold-dark hover:underline"
                onClick={() => setBlocks((list) => list.filter((b) => b.id !== block.id))}
              >
                Remove
              </button>
            ) : null}
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
