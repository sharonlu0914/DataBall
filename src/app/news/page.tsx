import Link from "next/link";
import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/Ui";
import { sportLabel } from "@/lib/sports";
import { allNews } from "@/lib/news-store";
import { isEditor } from "@/lib/auth";
import { AddStory, DeleteStory } from "@/components/AddStory";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [posts, editor] = await Promise.all([allNews(), isEditor()]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          kicker="News"
          title="The desk"
          lede="Match previews, Sports Day notes, and league stories."
        />
        {editor ? (
          <div className="pt-8">
            <AddStory />
          </div>
        ) : null}
      </div>
      {error ? <p className="mb-6 text-sm text-gold-dark">Title and body are required.</p> : null}
      {posts.length === 0 ? <p className="text-sm text-berkeley/60">No stories yet.</p> : null}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.slug}>
            <p className="label-ui text-[0.7rem] text-berkeley/50">
              {post.date}
              {post.sport ? ` · ${sportLabel(post.sport)}` : ""}
            </p>
            <h2 className="mt-2 text-2xl">
              <Link href={`/news/${post.slug}`} className="hover:text-gold-dark">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-berkeley/70">{post.excerpt}</p>
            {editor ? (
              <div className="mt-3 flex gap-4">
                <Link href={`/news/${post.slug}`} className="text-sm hover:underline">
                  Edit
                </Link>
                <DeleteStory slug={post.slug} />
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
