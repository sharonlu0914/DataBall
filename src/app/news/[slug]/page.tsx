import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/Ui";
import { sportLabel } from "@/lib/sports";
import { allNews } from "@/lib/news-store";
import { NewsBody } from "@/components/NewsBody";
import { isEditor } from "@/lib/auth";
import { DeleteStory, StoryComposer } from "@/components/AddStory";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allNews().find((n) => n.slug === slug);
  return { title: post?.title ?? "News" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = allNews().find((n) => n.slug === slug);
  if (!post) notFound();
  const editor = await isEditor();

  return (
    <article>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker={post.sport ? sportLabel(post.sport) : "News"}
          title={post.title}
          lede={`${post.date} · ${post.excerpt}`}
        />
        {editor ? (
          <div className="flex flex-col items-end gap-3 pt-8">
            <StoryComposer post={post} triggerLabel="Edit story" />
            <DeleteStory slug={post.slug} />
          </div>
        ) : null}
      </div>
      <NewsBody body={post.body} blocks={post.blocks} />
    </article>
  );
}
