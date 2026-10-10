"use client";

import { useState } from "react";
import type { HomeMatchCard } from "@/lib/types";
import { sportLabel } from "@/lib/sports";

export function EloOutcome({
  nameA,
  nameB,
  pctA,
  pctB,
  eloA,
  eloB,
  comment,
}: {
  nameA: string;
  nameB: string;
  pctA: number;
  pctB: number;
  eloA?: number;
  eloB?: number;
  comment: string;
}) {
  const showA = Math.round(pctA * 1000) / 10;
  const showB = Math.round(pctB * 1000) / 10;
  return (
    <div className="mt-5 border-t border-berkeley/10 pt-4">
      <p className="rounded-md bg-gold/20 px-3 py-2 text-sm leading-6">{comment}</p>
      {eloA != null && eloB != null ? (
        <div className="mt-3 flex justify-between font-mono text-xs text-berkeley/50">
          <span>
            {nameA}: {eloA}
          </span>
          <span>
            {nameB}: {eloB}
          </span>
        </div>
      ) : null}
      <div className="mt-2 flex h-7 overflow-hidden rounded">
        <div
          className="flex items-center justify-center bg-berkeley font-mono text-xs font-bold text-gold"
          style={{ width: `${showA}%` }}
        >
          {showA >= 12 ? `${showA}%` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-berkeley/35 font-mono text-xs font-bold text-berkeley"
          style={{ width: `${showB}%` }}
        >
          {showB >= 12 ? `${showB}%` : ""}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-berkeley/55">
        <span>
          {nameA} {showA}%
        </span>
        <span>
          {nameB} {showB}%
        </span>
      </div>
    </div>
  );
}

export function PredictButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="label-ui mt-4 rounded-full bg-berkeley px-5 py-2 text-[0.75rem] text-gold disabled:cursor-not-allowed disabled:opacity-40"
    >
      Predict
    </button>
  );
}

export function EloPickInner({ matches }: { matches: HomeMatchCard[] }) {
  const pool = [...matches].sort((a, b) => {
    const openA = a.scoreA == null ? 0 : 1;
    const openB = b.scoreA == null ? 0 : 1;
    return openA - openB || b.date.localeCompare(a.date);
  });
  const [id, setId] = useState(pool[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const match = pool.find((row) => row.id === id);

  if (pool.length === 0) {
    return <p className="text-sm text-berkeley/55">No matches to predict yet.</p>;
  }

  return (
    <div>
      <label className="text-sm">
        <span className="label-ui text-[0.65rem] text-berkeley/45">Match</span>
        <select
          className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2"
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            setRevealed(false);
          }}
        >
          {pool.map((row) => (
            <option key={row.id} value={row.id}>
              {sportLabel(row.sport)} · {row.teamAName} vs {row.teamBName} ({row.date})
            </option>
          ))}
        </select>
      </label>
      <PredictButton disabled={!match || revealed} onClick={() => setRevealed(true)} />
      {revealed && match ? (
        <EloOutcome
          nameA={match.teamAName}
          nameB={match.teamBName}
          pctA={match.pctA}
          pctB={match.pctB}
          eloA={match.eloA}
          eloB={match.eloB}
          comment={match.comment}
        />
      ) : (
        <p className="mt-3 text-sm text-berkeley/50">Choose a match, then hit Predict.</p>
      )}
    </div>
  );
}
