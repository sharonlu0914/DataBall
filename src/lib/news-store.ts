import type { NewsPost } from "@/lib/types";
import { news as seedNews } from "@/data/seed";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";

function extraNews() {
  return readJsonFile<NewsPost[]>("data/news.json", []);
}

function deletedSlugs() {
  return readJsonFile<string[]>("data/news-deleted.json", []);
}

export function allNews(): NewsPost[] {
  const deleted = new Set(deletedSlugs());
  const map = new Map<string, NewsPost>();
  for (const post of seedNews) {
    if (!deleted.has(post.slug)) map.set(post.slug, post);
  }
  for (const post of extraNews()) {
    if (!deleted.has(post.slug)) map.set(post.slug, post);
  }
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function getNews(slug: string) {
  return allNews().find((post) => post.slug === slug);
}

export function saveNewsPost(post: NewsPost) {
  const extra = extraNews().filter((row) => row.slug !== post.slug);
  extra.unshift(post);
  writeJsonFile("data/news.json", extra);
}

export function deleteNews(slug: string) {
  writeJsonFile(
    "data/news.json",
    extraNews().filter((row) => row.slug !== slug),
  );
  const deleted = deletedSlugs();
  if (!deleted.includes(slug)) {
    deleted.push(slug);
    writeJsonFile("data/news-deleted.json", deleted);
  }
}
