import { loadMatches, loadPlayers } from "./data";
import { elo, getRatings, openskill, type Match } from "./rating";

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

const system_openskill = openskill();
const ratings_openskill = getRatings(matches, system_openskill)
  .toSorted(
    (a, b) =>
      system_openskill.toNumber(b.rating) - system_openskill.toNumber(a.rating)
  )
  .map((x, i) => ({
    rank: i + 1,
    player: x.player.name,
    rating: system_openskill.toNumber(x.rating),
  }));

const system_elo = elo();
const ratings_elo = getRatings(matches, system_elo)
  .toSorted(
    (a, b) => system_elo.toNumber(b.rating) - system_elo.toNumber(a.rating)
  )
  .map((x, i) => ({
    rank: i + 1,
    player: x.player.name,
    rating: system_elo.toNumber(x.rating),
  }));

type Bubble = {
  label: string;
  data: [
    {
      // X Value
      x: number;

      // Y Value
      y: number;

      // Bubble radius in pixels (not scaled).
      r: number;
    }
  ];
};

const ratingsMap_openskill = Object.fromEntries(
  ratings_openskill.map((x) => [x.player, x])
);
const ratingsMap_elo = Object.fromEntries(
  ratings_elo.map((x) => [x.player, x])
);

const playersWithBubble = ratings_elo.map((x) => x.player);

const bubbles_rating: Bubble[] = playersWithBubble.map((player) => ({
  label: player,
  data: [
    {
      r: 6,
      x: ratingsMap_openskill[player].rating,
      y: ratingsMap_elo[player].rating,
    },
  ],
}));

const bubbles_ranking: Bubble[] = playersWithBubble.map((player) => ({
  label: player,
  data: [
    {
      r: 6,
      x: ratingsMap_openskill[player].rank,
      y: ratingsMap_elo[player].rank,
    },
  ],
}));

console.log(JSON.stringify(bubbles_rating, undefined, 2));
