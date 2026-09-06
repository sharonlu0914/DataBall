import { RecentsBoard } from "@/components/RecentsBoard";
import { readBoard } from "@/lib/board-store";
import { allNews } from "@/lib/news-store";
import { isEditor } from "@/lib/auth";
import { homeMatchCards, homeSlate } from "@/lib/slate";

export default async function Home() {
  const [widgets, posts, editor] = await Promise.all([readBoard(), allNews(), isEditor()]);
  const slate = homeSlate();
  const matches = homeMatchCards();

  return (
    <div>
      <div className="relative left-1/2 h-[calc(100svh-4.35rem)] w-screen max-w-[100vw] -translate-x-1/2 -mt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home-hero.jpg"
          alt="DataBall"
          className="absolute inset-0 h-full w-full bg-[#003262] object-cover object-center"
        />
        <a
          href="#recents"
          aria-label="See recents"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] transition hover:text-white"
        >
          <svg className="h-11 w-11 animate-bounce" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
      <div id="recents" className="scroll-mt-24 pt-10">
        <RecentsBoard widgets={widgets} posts={posts} isEditor={editor} slate={slate} matches={matches} />
      </div>
    </div>
  );
}
