
export enum CardType {
  WHITE = 'WHITE', // Prompt/Question
  BLACK = 'BLACK'  // Answer/Response
}

export enum GameMode {
  NORMAL = 'NORMAL',
  QUICK = 'QUICK',
  CASINO = 'CASINO',
  AULA = 'AULA'
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  DEALING = 'DEALING',
  PLAYING = 'PLAYING',
  REVEALING = 'REVEALING',
  RESOLVING = 'RESOLVING',
  ENDED = 'ENDED'
}

export interface Card {
  id: string;
  text: string;
  type: CardType;
  metadata?: any;
}

export interface Player {
  id: string;
  name: string;
  lucas: number;
  hand: Card[];
  isDealer: boolean;
  playedCards: Card[];
  isWinner?: boolean;
  isLoser?: boolean;
}

export interface GameState {
  roomId: string;
  status: GameStatus;
  mode: GameMode;
  players: Player[];
  activeWhites: Card[];
  pot: number;
  currentRound: number;
  dealerId: string;
  deckBlack: Card[];
  deckWhite: Card[];
}

export interface GameAction {
  type: string;
  payload: any;
}
