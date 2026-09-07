"use client";

import { useRef, useState } from "react";

export async function uploadMedia(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    throw new Error(json.error === "Unauthorized" ? "Sign in as an editor to upload." : json.error || "Upload failed");
  }
  return json.url;
}

export function MediaPicker({
  kind,
  value,
  onChange,
  name,
}: {
  kind: "image" | "video";
  value?: string;
  onChange: (url: string) => void;
  name?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [linkOpen, setLinkOpen] = useState(Boolean(value?.startsWith("http")));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadMedia(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        className="fixed left-[-9999px] h-px w-px opacity-0"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold disabled:opacity-60"
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : value ? `Replace ${kind}` : `Choose ${kind} from computer`}
      </button>
      <button type="button" className="ml-3 text-xs text-berkeley/50 hover:underline" onClick={() => setLinkOpen((v) => !v)}>
        {linkOpen ? "Hide link" : "Or paste a link"}
      </button>
      {linkOpen ? (
        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={kind === "video" ? "YouTube or video link" : "Image link"}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      ) : null}
      {error ? <p className="text-sm text-gold-dark">{error}</p> : null}
      {value && kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="max-h-56 rounded-md object-cover" />
      ) : null}
      {value && kind === "video" && !value.includes("youtu") ? (
        <video src={value} controls className="max-h-56 w-full rounded-md" />
      ) : null}
    </div>
  );
}
