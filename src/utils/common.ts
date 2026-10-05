export interface PLAYER_TALLY {
  playerName: string;
  wins: number;
}

export interface POPULATED_PLAYER {
  id: string;
  playerName: string;
}

export interface POPULATED_MATCH {
  id: string;
  playerOne: POPULATED_PLAYER;
  playerTwo: POPULATED_PLAYER;
  numberOfSets: number;
  numberOfGames: number;
  gamesWonByPlayerOne: number;
  gamesWonByPlayerTwo: number;
  createdDate: string;
}
