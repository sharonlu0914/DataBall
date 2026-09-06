import type {
  Championship,
  EloPrediction,
  LeagueRecord,
  Match,
  NewsPost,
  Player,
  RankingRow,
  SchoolClass,
  Sport,
  SportsDayRecord,
  Team,
} from "@/lib/types";

export const classes: SchoolClass[] = [];
export const players: Player[] = [];
export const teams: Team[] = [];
export const matches: Match[] = [];
export const rankingsBySport: Record<Sport, RankingRow[]> = {
  basketball: [],
  soccer: [],
  volleyball: [],
  ultimate: [],
};
export const news: NewsPost[] = [];
export const sportsDayRecords: SportsDayRecord[] = [];
export const leagueRecords: LeagueRecord[] = [];
export const championships: Championship[] = [];
export const eloPredictions: EloPrediction[] = [];
export const homeGallery: { title: string; caption: string }[] = [];
