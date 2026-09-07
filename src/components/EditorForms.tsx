"use client";

import { useState } from "react";
import { SPORTS } from "@/lib/types";
import { MediaPicker } from "@/components/MediaPicker";

const field = "mt-3 w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function AddSportsDay() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => setOpen(true)}>
        Add record
      </button>
    );
  }
  return (
    <form action="/api/records/sports-day" method="post" className="w-full max-w-md rounded-xl border border-berkeley/10 bg-white p-5">
      <p className="label-ui text-[0.7rem] text-gold-dark">Sports Day</p>
      <input name="year" type="number" defaultValue={new Date().getFullYear()} className={field} required />
      <input name="event" placeholder="Event (100m, long jump…)" className={field} required />
      <input name="mark" placeholder="Mark" className={field} required />
      <input name="holder" placeholder="Athlete" className={field} required />
      <input name="className" placeholder="Class (11A)" className={field} required />
      <div className="mt-4 flex gap-3">
        <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">Save</button>
        <button type="button" className="text-sm text-berkeley/60" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

export function AddLeagueHall() {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState("");
  if (!open) {
    return (
      <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => setOpen(true)}>
        Add record
      </button>
    );
  }
  return (
    <form action="/api/records/league" method="post" encType="multipart/form-data" className="w-full max-w-md rounded-xl border border-berkeley/10 bg-white p-5">
      <p className="label-ui text-[0.7rem] text-gold-dark">League hall</p>
      <select name="sport" className={field} required>
        {SPORTS.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
      <input name="title" placeholder="Record title" className={field} required />
      <input name="mark" placeholder="Mark" className={field} required />
      <input name="holder" placeholder="Player" className={field} required />
      <input name="className" placeholder="Class" className={field} required />
      <input name="year" type="number" defaultValue={new Date().getFullYear()} className={field} required />
      <input name="note" placeholder="Note (optional)" className={field} />
      <p className="label-ui mt-3 text-[0.65rem] text-berkeley/55">Photo</p>
      <div className="mt-1">
        <MediaPicker kind="image" name="imageUrl" value={photo} onChange={setPhoto} />
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">Save</button>
        <button type="button" className="text-sm text-berkeley/60" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

export function AddClassForm() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => setOpen(true)}>
        Add class
      </button>
    );
  }
  return (
    <form action="/api/classes" method="post" className="w-full max-w-md rounded-xl border border-berkeley/10 bg-white p-5">
      <p className="label-ui text-[0.7rem] text-gold-dark">New class</p>
      <input name="name" placeholder="Name (9A)" className={field} required />
      <input name="grade" type="number" placeholder="Grade" className={field} required />
      <div className="mt-4 flex gap-3">
        <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">Save</button>
        <button type="button" className="text-sm text-berkeley/60" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

export function EditClassForm({ id, name, grade }: { id: string; name: string; grade: number }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="text-sm text-berkeley/60 hover:underline" onClick={() => setOpen(true)}>
        Edit class
      </button>
    );
  }
  return (
    <form action="/api/classes" method="post" className="rounded-xl border border-berkeley/10 bg-white p-5">
      <input type="hidden" name="id" value={id} />
      <p className="label-ui text-[0.7rem] text-gold-dark">Edit class</p>
      <input name="name" defaultValue={name} className={field} required />
      <input name="grade" type="number" defaultValue={grade} className={field} required />
      <div className="mt-4 flex gap-3">
        <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">Save</button>
        <button type="button" className="text-sm text-berkeley/60" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}

export function AddPlayerForm({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold" onClick={() => setOpen(true)}>
        Add player
      </button>
    );
  }
  return (
    <form action="/api/players" method="post" className="rounded-xl border border-berkeley/10 bg-white p-5">
      <input type="hidden" name="classId" value={classId} />
      <p className="label-ui text-[0.7rem] text-gold-dark">New player</p>
      <input name="name" placeholder="Name" className={field} required />
      <input name="bio" placeholder="Bio" className={field} />
      <fieldset className="mt-3 space-y-1 text-sm">
        {SPORTS.map((sport) => (
          <label key={sport} className="flex items-center gap-2">
            <input type="checkbox" name="sports" value={sport} />
            {sport}
          </label>
        ))}
      </fieldset>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="label-ui rounded-full bg-berkeley px-4 py-2 text-[0.7rem] text-gold">Save</button>
        <button type="button" className="text-sm text-berkeley/60" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
