export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mb-10 max-w-3xl">
      {kicker ? (
        <p className="label-ui mb-2 text-[0.75rem] text-gold-dark">{kicker}</p>
      ) : null}
      <h1 className="font-heading text-4xl text-berkeley md:text-5xl">{title}</h1>
      {lede ? <p className="mt-3 text-base leading-7 text-berkeley/70">{lede}</p> : null}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-berkeley/10 bg-white p-5 shadow-[0_8px_30px_rgba(0,50,98,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-berkeley/60">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-berkeley/10">
        <div className="h-full rounded-full bg-berkeley" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
