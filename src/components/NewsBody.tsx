import type { NewsBlock } from "@/lib/types";
import { VideoEmbed } from "@/lib/media";

export function NewsBody({ body, blocks }: { body: string; blocks?: NewsBlock[] }) {
  if (!blocks?.length) {
    return <p className="max-w-2xl text-lg leading-8 whitespace-pre-wrap">{body}</p>;
  }
  return (
    <div className="max-w-2xl space-y-6">
      {blocks.map((block) => {
        if (block.type === "text") {
          return (
            <p key={block.id} className="text-lg leading-8 whitespace-pre-wrap">
              {block.text}
            </p>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={block.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.url} alt={block.caption ?? ""} className="w-full rounded-xl object-cover" />
              {block.caption ? <figcaption className="mt-2 text-sm text-berkeley/55">{block.caption}</figcaption> : null}
            </figure>
          );
        }
        return (
          <figure key={block.id}>
            <VideoEmbed url={block.url} title={block.caption} />
            {block.caption ? <figcaption className="mt-2 text-sm text-berkeley/55">{block.caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}
