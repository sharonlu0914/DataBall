export function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return match?.[1];
}

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const yt = youtubeId(url);
  if (yt) {
    return (
      <iframe
        title={title || "Video"}
        src={`https://www.youtube.com/embed/${yt}`}
        className="aspect-video w-full rounded-xl"
        allowFullScreen
      />
    );
  }
  return <video src={url} controls className="w-full rounded-xl" />;
}
