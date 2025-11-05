import { Color } from './chess';
import { Mistake } from './mistake';

export interface Game {
  id: string;
  pgn: string;
  playerColor: Color;
  opponentRating?: number;
  timeControl?: string;
  datePlayed?: Date;
  createdAt: Date;
}

export interface CreateGameInput {
  pgn: string;
  playerColor: Color;
  opponentRating?: number;
  timeControl?: string;
  datePlayed?: Date;
}

export interface GameWithMistakes extends Game {
  mistakes: Mistake[];
}
