
import { GameMode, GameStatus } from '../types';

/**
 * Representa una sala de juego en la base de datos.
 */
export interface GameRoom {
  id: string; // Código único de sala (ej: 'ABC123')
  status: GameStatus;
  mode: GameMode;
  pot: number;
  current_round: number;
  dealer_id: string | null; // UUID del jugador actual que es Dealer
  created_at: string;
  updated_at: string;
}

/**
 * Representa a un jugador dentro de una sala.
 */
export interface RoomPlayer {
  id: string; // UUID generado por la DB
  room_id: string;
  name: string;
  lucas: number;
  is_dealer: boolean;
  hand: string[]; // Lista de IDs de cartas negras
  is_active: boolean;
  joined_at: string;
}

/**
 * Registro de una carta jugada en una ronda específica.
 */
export interface PlayedCard {
  id: string;
  room_id: string;
  player_id: string;
  round_number: number;
  card_id: string;
  is_revealed: boolean;
  played_at: string;
}

/**
 * Historial de resultados de rondas finalizadas.
 */
export interface GameHistory {
  id: string;
  room_id: string;
  round_number: number;
  white_cards: string[]; // IDs de las cartas blancas usadas
  winner_id: string | null;
  loser_id: string | null;
  pot_awarded: number;
  created_at: string;
}
