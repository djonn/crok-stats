import { loadMatches, loadPlayers } from "./data";
import { getDatePartFromDate } from "./dateUtils";
import {
  elo,
  getPlayerRatingHistory,
  getRatings,
  openskill,
  type Match,
} from "./rating";

console.log("Hello via Bun!");

const players = await loadPlayers("./data/user.csv");
const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

const allMatches = await loadMatches("./data/matches.csv");
const matches: Match[] = allMatches
  .filter((x) => x.seasonId === 2)
  .map((match) => {
    return {
      ...match,
      whitePlayerOne: playerMap[match.whitePlayerOne],
      whitePlayerTwo: !!match.whitePlayerTwo
        ? playerMap[match.whitePlayerTwo]
        : null,
      blackPlayerOne: playerMap[match.blackPlayerOne],
      blackPlayerTwo: !!match.blackPlayerTwo
        ? playerMap[match.blackPlayerTwo]
        : null,
    };
  });

const system = elo();

const histories = players.flatMap((player) =>
  Object.entries(getPlayerRatingHistory(matches, player.id, system)).map(
    ([date, rating]) => ({
      player: player.name,
      date: parseInt(date, 10),
      rating,
    })
  )
);

const dates = [...new Set(histories.map((x) => x.date))].toSorted(
  (a, b) => a - b
);

const playerNames = players.map((x) => x.name);

// TODO: map histories to have all dates, even if undefined (or same as previous

type Line = {
  label: string;
  data: number[];
};

const result: Line[] = [];

for (const playerName of playerNames) {
  let lastForPlayer = system.defaultRating;
  let playerHistory = [];
  for (const date of dates) {
    lastForPlayer =
      histories.find((x) => x.date === date && x.player === playerName)
        ?.rating ?? lastForPlayer;
    playerHistory.push(lastForPlayer);
  }
  result.push({ label: playerName, data: playerHistory });
}

// console.log(JSON.stringify(result, undefined, 2));

const labels = dates.map((x) => getDatePartFromDate(new Date(x)));
console.log(JSON.stringify(labels));
