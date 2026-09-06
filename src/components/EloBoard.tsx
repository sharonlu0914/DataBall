"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Ui";
import {
  DEFAULT_ELO_PARAMS,
  computeElo,
  formComment,
  matchupComment,
  winProbability,
} from "@/lib/elo";
import type { EloGame, EloParams, SchoolClass, Sport, Team } from "@/lib/types";

function shortName(team?: Team) {
  if (!team) return "Unknown";
  return team.name.replace(/ Basketball| Soccer| Volleyball| Ultimate/, "") || team.name;
}

export function EloBoard({
  sport,
  teams,
  classes,
  games,
  params,
  isEditor,
}: {
  sport: Sport;
  teams: Team[];
  classes: SchoolClass[];
  games: EloGame[];
  params: EloParams;
  isEditor: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [predA, setPredA] = useState(teams[0]?.id ?? "");
  const [predB, setPredB] = useState(teams[1]?.id ?? teams[0]?.id ?? "");
  const [k, setK] = useState(String(params.k));
  const [c, setC] = useState(String(params.c));

  const { board, history, elo } = useMemo(
    () => computeElo(games, params, teams),
    [games, params, teams],
  );
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const selected = board.find((row) => row.teamId === selectedId);
  const selectedHistory = history.filter(
    (row) => row.game.winnerId === selectedId || row.game.loserId === selectedId,
  );

  async function post(body: unknown) {
    await fetch("/api/elo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  const folders = [...new Set(history.map((row) => row.game.folder || "Unfiled"))];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="label-ui mb-4 flex items-center gap-3 text-[0.75rem] text-berkeley/50">
          Current board
          <span className="h-px flex-1 bg-berkeley/15" />
        </h2>
        {board.length === 0 ? (
          <p className="text-sm text-berkeley/55">No teams yet. Add a class team to start the board.</p>
        ) : (
          <div className="space-y-2">
            {board.map((row, index) => {
              const team = teamMap.get(row.teamId);
              const active = row.teamId === selectedId;
              return (
                <button
                  key={row.teamId}
                  type="button"
                  onClick={() => setSelectedId(row.teamId)}
                  className={`relative flex w-full items-center gap-4 overflow-hidden rounded-lg border bg-white px-4 py-3 text-left ${
                    index === 0 ? "border-gold" : "border-berkeley/10"
                  } ${active ? "border-berkeley bg-gold/15" : "hover:border-berkeley/30"}`}
                >
                  <span className={`w-8 font-mono text-sm font-bold ${index === 0 ? "text-gold-dark" : "text-berkeley/35"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-heading text-lg">{shortName(team)}</span>
                    <span className="ml-2 font-mono text-[10px] text-berkeley/40">
                      {row.games} GP · {row.wins}–{row.losses}
                    </span>
                  </span>
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {row.elo}
                    {row.delta !== null ? (
                      <span className={`ml-2 text-xs ${row.delta >= 0 ? "text-emerald-700" : "text-gold-dark"}`}>
                        {row.delta >= 0 ? `+${row.delta}` : row.delta}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selected && selectedId ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-berkeley/40 px-4 py-16"
          onClick={() => setSelectedId(null)}
        >
          <div className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
          <Card className="max-h-[75vh] overflow-hidden">
            <div
              className="mb-3 flex items-start justify-between gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <p className="font-heading text-xl">{shortName(teamMap.get(selectedId))}</p>
                <p className="mt-2 rounded-md bg-gold/20 px-3 py-2 text-sm text-berkeley">
                  {formComment(selected, board.findIndex((r) => r.teamId === selectedId) + 1, board.length, selectedHistory)}
                </p>
              </div>
              <button type="button" className="text-berkeley/40 hover:text-berkeley" onClick={() => setSelectedId(null)}>
                ×
              </button>
            </div>
            <div className="max-h-[48vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {selectedHistory.length === 0 ? (
                <p className="py-4 text-center text-sm text-berkeley/50">No results yet.</p>
              ) : (
                [...selectedHistory].reverse().map((row) => {
                  const win = row.game.winnerId === selectedId;
                  const opp = teamMap.get(win ? row.game.loserId : row.game.winnerId);
                  const before = win ? row.winnerBefore : row.loserBefore;
                  const after = win ? row.winnerAfter : row.loserAfter;
                  return (
                    <div key={row.game.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-berkeley/10 py-2 text-sm last:border-0">
                      <span className={`rounded px-2 py-1 text-center font-mono text-xs font-bold ${win ? "bg-emerald-100 text-emerald-800" : "bg-gold/25 text-gold-dark"}`}>
                        {win ? "W" : "L"}
                      </span>
                      <span>
                        vs{" "}
                        {opp ? (
                          <Link href={`/classes/${opp.classId}`} className="hover:underline">
                            {shortName(opp)}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                        {row.game.note ? <span className="mt-0.5 block text-xs text-berkeley/45">{row.game.note}</span> : null}
                      </span>
                      <span className="font-mono text-xs text-berkeley/55">
                        {before} → {after}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
          </div>
        </div>
      ) : null}

      <section>
        <h2 className="label-ui mb-4 flex items-center gap-3 text-[0.75rem] text-berkeley/50">
          Matchup
          <span className="h-px flex-1 bg-berkeley/15" />
        </h2>
        <Card>
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <label className="text-sm">
              <span className="label-ui text-[0.65rem] text-berkeley/45">Team one</span>
              <select className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2" value={predA} onChange={(e) => setPredA(e.target.value)}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {shortName(team)}
                  </option>
                ))}
              </select>
            </label>
            <p className="label-ui pb-3 text-center text-[0.7rem] text-berkeley/35">VS</p>
            <label className="text-sm">
              <span className="label-ui text-[0.65rem] text-berkeley/45">Team two</span>
              <select className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2" value={predB} onChange={(e) => setPredB(e.target.value)}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {shortName(team)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {predA && predB && predA !== predB ? (
            <Prediction
              nameA={shortName(teamMap.get(predA))}
              nameB={shortName(teamMap.get(predB))}
              eloA={elo[predA] ?? 1000}
              eloB={elo[predB] ?? 1000}
              c={params.c}
              comment={matchupComment(predA, predB, games, elo[predA] ?? 1000, elo[predB] ?? 1000)}
            />
          ) : (
            <p className="mt-4 text-sm text-berkeley/50">Pick two different teams.</p>
          )}
        </Card>
      </section>

      {isEditor ? (
        <>
          <section>
            <h2 className="label-ui mb-4 flex items-center gap-3 text-[0.75rem] text-berkeley/50">
              Parameters
              <span className="h-px flex-1 bg-berkeley/15" />
            </h2>
            <Card>
              <form
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void post({ sport, params: { k: Number(k), c: Number(c) } });
                }}
              >
                <label className="text-sm">
                  <span className="label-ui text-[0.65rem] text-berkeley/45">K (update size)</span>
                  <input className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2 font-mono" value={k} onChange={(e) => setK(e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="label-ui text-[0.65rem] text-berkeley/45">c (spread)</span>
                  <input className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2 font-mono" value={c} onChange={(e) => setC(e.target.value)} />
                </label>
                <div className="flex items-end gap-2">
                  <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
                    Save
                  </button>
                  <button
                    type="button"
                    className="text-sm text-berkeley/55 hover:underline"
                    onClick={() => {
                      setK(String(DEFAULT_ELO_PARAMS.k));
                      setC(String(DEFAULT_ELO_PARAMS.c));
                      void post({ sport, params: DEFAULT_ELO_PARAMS });
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </Card>
          </section>

          <section>
            <h2 className="label-ui mb-4 flex items-center gap-3 text-[0.75rem] text-berkeley/50">
              Log a result
              <span className="h-px flex-1 bg-berkeley/15" />
            </h2>
            <Card>
              {teams.length < 2 ? (
                <AddTeamInline sport={sport} classes={classes} />
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    void post({
                      game: {
                        id: "",
                        sport,
                        winnerId: String(form.get("winnerId")),
                        loserId: String(form.get("loserId")),
                        note: String(form.get("note")),
                        folder: String(form.get("folder")),
                      },
                    });
                    event.currentTarget.reset();
                  }}
                >
                  <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
                    <label className="text-sm">
                      <span className="label-ui text-[0.65rem] text-berkeley/45">Winner</span>
                      <select name="winnerId" className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2" required>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {shortName(team)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="label-ui pb-3 text-center text-[0.7rem] text-berkeley/35">beat</p>
                    <label className="text-sm">
                      <span className="label-ui text-[0.65rem] text-berkeley/45">Loser</span>
                      <select name="loserId" className="mt-1 w-full rounded-lg border border-berkeley/15 px-3 py-2" required>
                        {teams.map((team) => (
                          <option key={`l-${team.id}`} value={team.id}>
                            {shortName(team)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <input name="folder" list="elo-folders" placeholder="Event (optional)" className="w-full rounded-lg border border-berkeley/15 px-3 py-2 text-sm" />
                  <datalist id="elo-folders">
                    {folders.map((folder) => (
                      <option key={folder} value={folder} />
                    ))}
                  </datalist>
                  <input name="note" placeholder="Note (optional)" className="w-full rounded-lg border border-berkeley/15 px-3 py-2 text-sm" />
                  <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
                    Add game
                  </button>
                </form>
              )}
              <div className="mt-6">
                <AddTeamInline sport={sport} classes={classes} />
              </div>
            </Card>
          </section>
        </>
      ) : null}

      <section>
        <h2 className="label-ui mb-4 flex items-center gap-3 text-[0.75rem] text-berkeley/50">
          Results log
          <span className="h-px flex-1 bg-berkeley/15" />
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-berkeley/55">No Elo games logged yet.</p>
        ) : (
          folders.map((folder) => {
            const rows = history.filter((row) => (row.game.folder || "Unfiled") === folder);
            return (
              <div key={folder} className="mb-6">
                <p className="mb-2 font-heading text-base">
                  {folder} <span className="font-mono text-xs font-normal text-berkeley/40">{rows.length}</span>
                </p>
                {rows.map((row, index) => (
                  <div key={row.game.id} className="grid grid-cols-[2rem_1fr_auto_auto] items-center gap-3 border-b border-berkeley/10 py-2 text-sm">
                    <span className="font-mono text-xs text-berkeley/35">#{index + 1}</span>
                    <span>
                      <span className="font-semibold">{shortName(teamMap.get(row.game.winnerId))}</span>
                      <span className="text-berkeley/45"> beat </span>
                      <span className="text-berkeley/70">{shortName(teamMap.get(row.game.loserId))}</span>
                      {row.game.note ? <span className="mt-0.5 block text-xs text-berkeley/45">{row.game.note}</span> : null}
                    </span>
                    <span className="font-mono text-xs text-berkeley/50">
                      {row.winnerBefore}→{row.winnerAfter} / {row.loserBefore}→{row.loserAfter}
                    </span>
                    {isEditor ? (
                      <button
                        type="button"
                        className="text-gold-dark"
                        onClick={() => void post({ deleteGameId: row.game.id })}
                      >
                        ×
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

function Prediction({
  nameA,
  nameB,
  eloA,
  eloB,
  c,
  comment,
}: {
  nameA: string;
  nameB: string;
  eloA: number;
  eloB: number;
  c: number;
  comment: string;
}) {
  const pA = winProbability(eloA, eloB, c);
  const pctA = Math.round(pA * 1000) / 10;
  const pctB = Math.round((1 - pA) * 1000) / 10;
  return (
    <div className="mt-5 border-t border-berkeley/10 pt-4">
      <p className="rounded-md bg-gold/20 px-3 py-2 text-sm">{comment}</p>
      <div className="mt-3 flex justify-between font-mono text-xs text-berkeley/50">
        <span>
          {nameA}: {eloA}
        </span>
        <span>
          {nameB}: {eloB}
        </span>
      </div>
      <div className="mt-2 flex h-7 overflow-hidden rounded">
        <div className="flex items-center justify-center bg-berkeley font-mono text-xs font-bold text-gold" style={{ width: `${pctA}%` }}>
          {pctA >= 12 ? `${pctA}%` : ""}
        </div>
        <div className="flex items-center justify-center bg-berkeley/35 font-mono text-xs font-bold text-berkeley" style={{ width: `${pctB}%` }}>
          {pctB >= 12 ? `${pctB}%` : ""}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-berkeley/55">
        <span>
          {nameA} {pctA}%
        </span>
        <span>
          {nameB} {pctB}%
        </span>
      </div>
    </div>
  );
}

function AddTeamInline({ sport, classes }: { sport: Sport; classes: SchoolClass[] }) {
  const router = useRouter();
  if (classes.length === 0) {
    return <p className="text-sm text-berkeley/55">Add a class first, then you can put a team on this board.</p>;
  }
  return (
    <form
      className="grid gap-2 sm:grid-cols-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await fetch("/api/league", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team: {
              sport,
              classId: String(form.get("classId")),
              name: String(form.get("name")),
              group: "A",
              playerIds: [],
            },
          }),
        });
        router.refresh();
      }}
    >
      <p className="label-ui col-span-full text-[0.65rem] text-berkeley/45">Add team</p>
      <select name="classId" className="rounded-lg border border-berkeley/15 px-3 py-2 text-sm" required>
        {classes.map((klass) => (
          <option key={klass.id} value={klass.id}>
            {klass.name}
          </option>
        ))}
      </select>
      <input name="name" placeholder="Team name" className="rounded-lg border border-berkeley/15 px-3 py-2 text-sm sm:col-span-2" required />
      <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
        Add
      </button>
    </form>
  );
}
