import { notFound } from "next/navigation";
import { isSport } from "@/lib/sports";
import { SportSubnav } from "@/components/SportSubnav";
import { SPORTS } from "@/lib/types";

export function generateStaticParams() {
  return SPORTS.map((sport) => ({ sport }));
}

export default async function SportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string }>;
}) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  return (
    <div>
      <SportSubnav sport={sport} />
      {children}
    </div>
  );
}
