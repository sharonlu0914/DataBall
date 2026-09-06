import Link from "next/link";
import type { Sport } from "@/lib/types";
import { sportLabel } from "@/lib/sports";

export function SportSubnav({ sport }: { sport: Sport }) {
  const base = `/sports/${sport}`;
  const items = [
    { href: base, label: "Overview" },
    { href: `${base}/bracket`, label: "Bracket" },
    { href: `${base}/elo`, label: "Elo" },
    { href: `${base}/rankings`, label: "Rankings" },
    { href: `${base}/stats`, label: "Stats" },
    { href: `${base}/players`, label: "Players & classes" },
    { href: `${base}/history`, label: "History" },
  ];
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="label-ui rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.7rem] text-berkeley/80 hover:border-gold hover:text-berkeley"
        >
          {item.label}
        </Link>
      ))}
      <span className="label-ui self-center text-[0.7rem] text-berkeley/40">{sportLabel(sport)}</span>
    </div>
  );
}
