import { NextResponse } from "next/server";
import { isEditor } from "@/lib/auth";
import { isSport } from "@/lib/sports";
import { deleteEloGame, saveEloGame, saveEloParams } from "@/lib/elo-store";
import type { EloGame } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isEditor())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    sport?: string;
    params?: { k?: number; c?: number };
    game?: EloGame;
    insertIndex?: number;
    deleteGameId?: string;
  };

  if (body.deleteGameId) {
    deleteEloGame(body.deleteGameId);
    return NextResponse.json({ ok: true });
  }

  if (body.params && isSport(body.sport ?? "")) {
    saveEloParams(body.sport as never, {
      k: Number(body.params.k),
      c: Number(body.params.c),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.game && isSport(body.game.sport) && body.game.winnerId && body.game.loserId && body.game.winnerId !== body.game.loserId) {
    const game: EloGame = {
      id: body.game.id || `elo-${Date.now().toString().slice(-8)}`,
      sport: body.game.sport,
      winnerId: body.game.winnerId,
      loserId: body.game.loserId,
      note: body.game.note?.trim() || undefined,
      folder: body.game.folder?.trim() || "Unfiled",
    };
    saveEloGame(game, body.insertIndex);
    return NextResponse.json({ game });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
