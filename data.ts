import type { Winner } from "./rating";

export type RawMatch = {
  id: number;
  whitePlayerOne: string;
  whitePlayerTwo: string | null;
  blackPlayerOne: string;
  blackPlayerTwo: string | null;
  result: Winner;
  scoreDiff: number;
  createdAt: Date;
  seasonId: number;
};

export type Player = {
  id: string;
  name: string;
};

const loadCsv = async (path: string) => {
  const file = await Bun.file(path).text();
  const rows = file.split("\n").map((x) => x.split(","));
  const headers = rows.splice(0, 1)[0];

  return rows.map((row) => {
    return Object.fromEntries(row.map((cell, i) => [headers[i], cell]));
  });
};

export async function loadPlayers(path: string) {
  const players = await loadCsv(path);
  return players as Player[];
}

export async function loadMatches(path: string) {
  const csv = await loadCsv(path);

  return csv.map((raw) => ({
    id: parseInt(raw.id, 10),
    whitePlayerOne: raw.white_player_one,
    whitePlayerTwo: raw.white_player_two !== "" ? raw.white_player_two : null,
    blackPlayerOne: raw.black_player_one,
    blackPlayerTwo: raw.black_player_two !== "" ? raw.black_player_two : null,
    result: raw.result,
    scoreDiff: parseInt(raw.score_diff, 10),
    createdAt: new Date(parseInt(raw.createdAt, 10) * 1000),
    seasonId: parseInt(raw.seasonId, 10),
  })) as RawMatch[];
}
