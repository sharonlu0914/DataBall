"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Match, RankingRow, SchoolClass, Sport, SportStatRow, Team } from "@/lib/types";
import { MediaPicker } from "@/components/MediaPicker";

const field = "mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

async function postLeague(body: unknown) {
  await fetch("/api/league", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function MatchBox({
  match,
  teamA,
  teamB,
}: {
  match: Match;
  teamA?: Team;
  teamB?: Team;
}) {
  function row(team: Team | undefined, score: number | null) {
    const label = team ? team.name.replace(/ Basketball| Soccer| Volleyball| Ultimate/, "") : "TBD";
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        {team ? (
          <Link href={`/classes/${team.classId}`} className="font-semibold hover:text-gold-dark">
            {label}
          </Link>
        ) : (
          <span className="font-semibold text-berkeley/40">{label}</span>
        )}
        <Link href={`/sports/${match.sport}/matches/${match.id}`} className="tabular-nums font-semibold hover:underline">
          {score ?? "–"}
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full min-w-[220px] overflow-hidden rounded border border-black/15 bg-white text-sm shadow-sm">
      <div className="border-b border-black/10">{row(teamA, match.scoreA)}</div>
      {row(teamB, match.scoreB)}
    </div>
  );
}

export function BracketEditor({
  sport,
  teams,
  classes,
}: {
  sport: Sport;
  teams: Team[];
  classes: SchoolClass[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => setOpen(true)}>
        Edit teams & scores
      </button>
    );
  }
  return (
    <div className="grid gap-6 rounded-xl border border-berkeley/10 bg-white p-5 md:grid-cols-2">
      <form
        className="space-y-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          await postLeague({
            team: {
              sport,
              classId: String(form.get("classId")),
              name: String(form.get("name")),
              group: String(form.get("group")),
              playerIds: [],
            },
          });
          router.refresh();
        }}
      >
        <p className="label-ui text-[0.7rem] text-gold-dark">Add team</p>
        <select name="classId" className={field} required>
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {klass.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="Team name" className={field} required />
        <select name="group" className={field}>
          <option value="A">Group A</option>
          <option value="B">Group B</option>
        </select>
        <button type="submit" className="label-ui mt-2 rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
          Save team
        </button>
      </form>
      <form
        className="space-y-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const scoreA = String(form.get("scoreA"));
          const scoreB = String(form.get("scoreB"));
          await postLeague({
            match: {
              id: "",
              sport,
              round: String(form.get("round")),
              date: String(form.get("date")),
              teamAId: String(form.get("teamAId")),
              teamBId: String(form.get("teamBId")),
              scoreA: scoreA === "" ? null : Number(scoreA),
              scoreB: scoreB === "" ? null : Number(scoreB),
            },
          });
          router.refresh();
        }}
      >
        <p className="label-ui text-[0.7rem] text-gold-dark">Add / log a game</p>
        <select name="round" className={field} required>
          <option>Group A</option>
          <option>Group B</option>
          <option>Semifinal</option>
          <option>Final</option>
        </select>
        <input name="date" type="date" className={field} required defaultValue={new Date().toISOString().slice(0, 10)} />
        <select name="teamAId" className={field} required>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select name="teamBId" className={field} required>
          {teams.map((team) => (
            <option key={`b-${team.id}`} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="scoreA" type="number" placeholder="Score A" className={field} />
          <input name="scoreB" type="number" placeholder="Score B" className={field} />
        </div>
        <button type="submit" className="label-ui mt-2 rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
          Save game
        </button>
        <button type="button" className="ml-3 text-sm text-berkeley/60" onClick={() => setOpen(false)}>
          Close
        </button>
      </form>
    </div>
  );
}

export function RankingsEditor({
  sport,
  rows,
  teams,
}: {
  sport: Sport;
  rows: RankingRow[];
  teams: Team[];
}) {
  const router = useRouter();
  const [list, setList] = useState(rows);

  async function save(next: RankingRow[]) {
    setList(next);
    await postLeague({ sport, rankings: next });
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-berkeley/10 bg-white p-5">
      <p className="label-ui text-[0.7rem] text-gold-dark">Edit rankings</p>
      {list.map((row, index) => (
        <div key={`${row.teamId}-${index}`} className="grid gap-2 md:grid-cols-6">
          <select
            className={field}
            value={row.teamId}
            onChange={(event) => {
              const next = list.map((item, i) => (i === index ? { ...item, teamId: event.target.value } : item));
              void save(next);
            }}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {(["wins", "losses", "pointsFor", "pointsAgainst", "elo"] as const).map((key) => (
            <input
              key={key}
              className={field}
              type="number"
              defaultValue={row[key]}
              onBlur={(event) => {
                const next = list.map((item, i) =>
                  i === index ? { ...item, [key]: Number(event.target.value) } : item,
                );
                void save(next);
              }}
            />
          ))}
          <button type="button" className="text-sm text-gold-dark" onClick={() => void save(list.filter((_, i) => i !== index))}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm hover:underline"
        onClick={() =>
          void save([
            ...list,
            { teamId: teams[0]?.id ?? "", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, elo: 1500 },
          ])
        }
      >
        Add row
      </button>
    </div>
  );
}

export function StatsEditor({ sport, rows }: { sport: Sport; rows: SportStatRow[] }) {
  const router = useRouter();
  return (
    <form
      className="max-w-md rounded-xl border border-berkeley/10 bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await postLeague({
          stat: {
            id: "",
            sport,
            name: String(form.get("name")),
            label: String(form.get("label")),
            value: Number(form.get("value")),
          },
        });
        router.refresh();
        event.currentTarget.reset();
      }}
    >
      <p className="label-ui text-[0.7rem] text-gold-dark">Add / update a leader</p>
      <input name="name" placeholder="Player or team" className={field} required />
      <input name="label" placeholder="Stat (PTS, goals…)" className={field} required />
      <input name="value" type="number" step="0.1" placeholder="Value" className={field} required />
      <button type="submit" className="label-ui mt-3 rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
        Save stat
      </button>
      <ul className="mt-4 space-y-1 text-sm">
        {rows.map((row) => (
          <li key={row.id} className="flex justify-between gap-3">
            <span>
              {row.name} · {row.label} {row.value}
            </span>
            <button
              type="button"
              className="text-gold-dark"
              onClick={async () => {
                await postLeague({ deleteStatId: row.id });
                router.refresh();
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
}

export function HistoryEditor({ sport, teams }: { sport: Sport; teams: Team[] }) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  return (
    <form
      className="max-w-md rounded-xl border border-berkeley/10 bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await postLeague({
          championship: {
            sport,
            year: Number(form.get("year")),
            championTeamId: String(form.get("championTeamId")),
            runnerUpTeamId: String(form.get("runnerUpTeamId")),
            videoUrl: videoUrl || undefined,
          },
        });
        setVideoUrl("");
        event.currentTarget.reset();
        router.refresh();
      }}
    >
      <p className="label-ui text-[0.7rem] text-gold-dark">Add championship</p>
      <input name="year" type="number" defaultValue={new Date().getFullYear()} className={field} required />
      <select name="championTeamId" className={field} required>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <select name="runnerUpTeamId" className={field} required>
        {teams.map((team) => (
          <option key={`r-${team.id}`} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <p className="label-ui mt-3 text-[0.65rem] text-berkeley/55">Film</p>
      <div className="mt-1">
        <MediaPicker kind="video" value={videoUrl} onChange={setVideoUrl} />
      </div>
      <button type="submit" className="label-ui mt-3 rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
        Save
      </button>
    </form>
  );
}

export function MatchEditor({
  match,
  players,
}: {
  match: Match;
  players: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(match.notes ?? "");
  const [videoUrl, setVideoUrl] = useState(match.videoUrl ?? "");
  const [scoreA, setScoreA] = useState(match.scoreA?.toString() ?? "");
  const [scoreB, setScoreB] = useState(match.scoreB?.toString() ?? "");
  const [box, setBox] = useState(match.boxScore ?? []);

  async function save(nextBox = box) {
    await postLeague({
      match: {
        ...match,
        notes,
        videoUrl,
        scoreA: scoreA === "" ? null : Number(scoreA),
        scoreB: scoreB === "" ? null : Number(scoreB),
        boxScore: nextBox,
      },
    });
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-berkeley/10 bg-white p-5">
      <p className="label-ui text-[0.7rem] text-gold-dark">Edit match</p>
      <div className="grid grid-cols-2 gap-2">
        <input className={field} value={scoreA} onChange={(e) => setScoreA(e.target.value)} placeholder="Score A" />
        <input className={field} value={scoreB} onChange={(e) => setScoreB(e.target.value)} placeholder="Score B" />
      </div>
      <textarea className={field} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <p className="label-ui mt-2 text-[0.65rem] text-berkeley/55">Video</p>
      <MediaPicker kind="video" value={videoUrl} onChange={setVideoUrl} />
      <p className="text-sm font-medium">Box / match data</p>
      {box.map((row, index) => (
        <div key={`${row.playerId}-${index}`} className="grid gap-2 md:grid-cols-3">
          <select
            className={field}
            value={row.playerId}
            onChange={(e) => setBox(box.map((item, i) => (i === index ? { ...item, playerId: e.target.value } : item)))}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
          <input
            className={field}
            value={row.label}
            onChange={(e) => setBox(box.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))}
          />
          <input
            className={field}
            type="number"
            value={row.value}
            onChange={(e) =>
              setBox(box.map((item, i) => (i === index ? { ...item, value: Number(e.target.value) } : item)))
            }
          />
        </div>
      ))}
      <button
        type="button"
        className="text-sm hover:underline"
        onClick={() => setBox([...box, { playerId: players[0]?.id ?? "", label: "PTS", value: 0 }])}
      >
        Add stat line
      </button>
      <div>
        <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => void save()}>
          Save match
        </button>
      </div>
    </div>
  );
}

export function EditPlayerForm({
  player,
}: {
  player: { id: string; name: string; classId: string; bio: string; sports: Sport[] };
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="text-sm text-berkeley/60 hover:underline" onClick={() => setOpen(true)}>
        Edit player
      </button>
    );
  }
  return (
    <form action="/api/players" method="post" className="rounded-xl border border-berkeley/10 bg-white p-5">
      <input type="hidden" name="id" value={player.id} />
      <input type="hidden" name="classId" value={player.classId} />
      <p className="label-ui text-[0.7rem] text-gold-dark">Edit player</p>
      <input name="name" defaultValue={player.name} className={field} required />
      <input name="bio" defaultValue={player.bio} className={field} />
      <fieldset className="mt-3 space-y-1 text-sm">
        {(["basketball", "soccer", "volleyball", "ultimate"] as Sport[]).map((sport) => (
          <label key={sport} className="flex items-center gap-2">
            <input type="checkbox" name="sports" value={sport} defaultChecked={player.sports.includes(sport)} />
            {sport}
          </label>
        ))}
      </fieldset>
      <button type="submit" className="label-ui mt-3 rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">
        Save
      </button>
    </form>
  );
}
