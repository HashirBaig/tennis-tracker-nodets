import {
  PLAYER_TALLY,
  PLAYER_STATS,
  WIN_LOSS_SUMMARY,
  POPULATED_MATCH,
} from "./const";

export const getWinLossSummary = (
  matches: POPULATED_MATCH[],
): WIN_LOSS_SUMMARY => {
  const winCounts = new Map<string, PLAYER_TALLY>();
  const lossCounts = new Map<string, PLAYER_TALLY>();
  const playerStats = new Map<string, PLAYER_STATS>();

  for (const match of matches) {
    const { playerOne, playerTwo, gamesWonByPlayerOne, gamesWonByPlayerTwo } =
      match;

    // Initialize player stats
    for (const player of [playerOne, playerTwo]) {
      const existingStats = playerStats.get(player.id);

      if (!existingStats) {
        playerStats.set(player.id, {
          playerName: player.playerName,
          wins: 0,
          losses: 0,
          totalMatchesPlayed: 0,
        });
      }

      playerStats.get(player.id)!.totalMatchesPlayed += 1;
    }

    // Skip ties — no winner/loser to credit
    if (gamesWonByPlayerOne === gamesWonByPlayerTwo) {
      continue;
    }

    const playerOneWon = gamesWonByPlayerOne > gamesWonByPlayerTwo;

    const winner = playerOneWon ? playerOne : playerTwo;
    const loser = playerOneWon ? playerTwo : playerOne;

    // Update win count
    const winEntry = winCounts.get(winner.id) ?? {
      playerName: winner.playerName,
      count: 0,
    };

    winEntry.count += 1;
    winCounts.set(winner.id, winEntry);

    // Update loss count
    const lossEntry = lossCounts.get(loser.id) ?? {
      playerName: loser.playerName,
      count: 0,
    };

    lossEntry.count += 1;
    lossCounts.set(loser.id, lossEntry);

    // Update per-player stats
    playerStats.get(winner.id)!.wins += 1;
    playerStats.get(loser.id)!.losses += 1;
  }

  const mostWinsEntry = [...winCounts.values()].reduce<PLAYER_TALLY | null>(
    (max, entry) => (!max || entry.count > max.count ? entry : max),
    null,
  );

  const mostLossesEntry = [...lossCounts.values()].reduce<PLAYER_TALLY | null>(
    (max, entry) => (!max || entry.count > max.count ? entry : max),
    null,
  );

  const summary = {
    mostWins: mostWinsEntry
      ? {
          playerName: mostWinsEntry.playerName,
          winCount: mostWinsEntry.count,
        }
      : null,

    mostLosses: mostLossesEntry
      ? {
          playerName: mostLossesEntry.playerName,
          lossCount: mostLossesEntry.count,
        }
      : null,

    totalMatchesPlayed: matches.length,
  };

  const winsAndLossesPerPlayer = [...playerStats.values()];

  return {
    summary,
    winsAndLossesPerPlayer,
  };
};
