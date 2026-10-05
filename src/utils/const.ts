export interface POPULATED_PLAYER {
  id: string;
  playerName: string;
}

export interface POPULATED_MATCH {
  _id?: string;
  playerOne: POPULATED_PLAYER;
  playerTwo: POPULATED_PLAYER;
  numberOfSets: number;
  numberOfGames: number;
  gamesWonByPlayerOne: number;
  gamesWonByPlayerTwo: number;
  createdDate: string;
}

export interface PLAYER_TALLY {
  playerName: string;
  count: number;
}

export interface PLAYER_STATS {
  playerName: string;
  wins: number;
  losses: number;
  totalMatchesPlayed: number;
}

export interface PLAYER_STATS {
  playerName: string;
  wins: number;
  losses: number;
  totalMatchesPlayed: number;
}

export interface WIN_LOSS_SUMMARY {
  summary: {
    mostWins: {
      playerName: string;
      winCount: number;
    } | null;

    mostLosses: {
      playerName: string;
      lossCount: number;
    } | null;

    totalMatchesPlayed: number;
  };

  winsAndLossesPerPlayer: PLAYER_STATS[];
}
