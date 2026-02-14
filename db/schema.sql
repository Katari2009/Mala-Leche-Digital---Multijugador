-- Esquema de Base de Datos para Mala Leche Digital
-- Diseñado para PostgreSQL / Supabase (Cultura Chilena & Educación)

-- 1. Definición de tipos personalizados (Enums) para asegurar consistencia con el código
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_mode') THEN
        CREATE TYPE game_mode AS ENUM ('NORMAL', 'QUICK', 'CASINO', 'AULA');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
        CREATE TYPE game_status AS ENUM ('LOBBY', 'DEALING', 'PLAYING', 'REVEALING', 'RESOLVING', 'ENDED');
    END IF;
END $$;

-- 2. Tabla: game_rooms (Información general de la sala y estado global)
CREATE TABLE IF NOT EXISTS game_rooms (
    id TEXT PRIMARY KEY, -- Código de sala humanamente legible (ej: 'K3J8P2')
    status game_status DEFAULT 'LOBBY' NOT NULL,
    mode game_mode DEFAULT 'AULA' NOT NULL,
    pot INTEGER DEFAULT 0 NOT NULL,
    current_round INTEGER DEFAULT 0 NOT NULL,
    dealer_id UUID, -- Referencia al jugador que tiene el rol de Dealer actual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla: room_players (Jugadores vinculados a una sala específica)
CREATE TABLE IF NOT EXISTS room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT REFERENCES game_rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lucas INTEGER DEFAULT 10 NOT NULL, -- Moneda del juego
    is_dealer BOOLEAN DEFAULT FALSE,
    hand JSONB DEFAULT '[]'::JSONB, -- Array de IDs de cartas negras en la mano del jugador
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar restricción de llave foránea circular para el dealer de la sala
-- Esto asegura que el dealer_id de game_rooms sea un jugador válido de room_players
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_dealer_ref') THEN
        ALTER TABLE game_rooms 
        ADD CONSTRAINT fk_dealer_ref 
        FOREIGN KEY (dealer_id) REFERENCES room_players(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Tabla: played_cards (Registro de cartas lanzadas en la ronda actual)
-- Se usa para el anonimato antes de la fase de revelación
CREATE TABLE IF NOT EXISTS played_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT REFERENCES game_rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES room_players(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    card_id TEXT NOT NULL, -- ID de la carta negra según el mazo seleccionado
    is_revealed BOOLEAN DEFAULT FALSE, -- Controla si el Dealer puede verla
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción: Un jugador solo puede jugar una carta por ronda (regla básica)
    UNIQUE(room_id, player_id, round_number)
);

-- 5. Tabla: game_history (Registro histórico de cada ronda para analítica y persistencia)
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT REFERENCES game_rooms(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    white_cards JSONB NOT NULL, -- IDs de las cartas blancas (preguntas) de la ronda
    winner_id UUID REFERENCES room_players(id) ON DELETE SET NULL,
    loser_id UUID REFERENCES room_players(id) ON DELETE SET NULL,
    pot_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas de Realtime y filtrado por salas
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_played_cards_room_round ON played_cards(room_id, round_number);
CREATE INDEX IF NOT EXISTS idx_game_history_room ON game_history(room_id);

-- Comentarios de tabla para documentación en base de datos
COMMENT ON TABLE game_rooms IS 'Estado maestro de la partida y configuración de la sala.';
COMMENT ON TABLE room_players IS 'Perfil de los jugadores, su saldo de lucas y cartas actuales.';
COMMENT ON TABLE played_cards IS 'Cartas negras jugadas de forma anónima durante el flujo de la ronda.';
COMMENT ON TABLE game_history IS 'Bitácora de ganadores, perdedores y premios por cada ronda finalizada.';
