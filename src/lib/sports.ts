import { SPORTS, type Sport } from "./types";

export const sportMeta: Record<
  Sport,
  { label: string; short: string; blurb: string; accent: string }
> = {
  badminton: {
    label: "Badminton",
    short: "BD",
    blurb: "Singles, doubles, brackets, and class rivalries.",
    accent: "#2D6A4F",
  },
  basketball: {
    label: "Basketball",
    short: "BB",
    blurb: "House league brackets, box scores, and class rivalries.",
    accent: "#FDB515",
  },
  soccer: {
    label: "Soccer",
    short: "SC",
    blurb: "Pitch-side results, Elo form, and knockout paths.",
    accent: "#003262",
  },
  volleyball: {
    label: "Volleyball",
    short: "VB",
    blurb: "Set scores, standings, and gym-night highlights.",
    accent: "#3B7EA1",
  },
  ultimate: {
    label: "Frisbee",
    short: "FRIS",
    blurb: "Disc league brackets, spirit, and season history.",
    accent: "#C4820E",
  },
};

export function isSport(value: string): value is Sport {
  return (SPORTS as readonly string[]).includes(value);
}

export function sportLabel(sport: Sport) {
  return sportMeta[sport].label;
}

export function shortTeamName(name: string) {
  return name.replace(/ Basketball| Soccer| Volleyball| Ultimate| Frisbee| Badminton/g, "") || name;
}

export function sportNavItems() {
  return SPORTS.map((sport) => ({ href: `/sports/${sport}`, label: sportMeta[sport].label }));
}

export function sportBracketLinks() {
  return SPORTS.map((sport) => ({
    href: `/sports/${sport}/bracket`,
    label: sportMeta[sport].label,
  }));
}
