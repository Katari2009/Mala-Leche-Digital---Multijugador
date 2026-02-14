
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GameState, 
  GameStatus, 
  GameMode, 
  Player, 
  Card, 
  CardType 
} from './types';
import { 
  MODO_AULA_DECK_WHITE, 
  MODO_AULA_DECK_BLACK, 
  CHILEAN_PHRASES 
} from './constants';
import GameCard from './components/GameCard';
import PlayerList from './components/PlayerList';
import SetupScreen from './components/SetupScreen';
import ManualModal from './components/ManualModal';
import { useRoomRealtime } from './hooks/useRoomRealtime';

const INITIAL_LUCAS = 10;
const INITIAL_HAND_SIZE = 10;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [showManual, setShowManual] = useState(true);

  // Hook de tiempo real - Se activa cuando hay un roomId en el estado local
  const { players: rtPlayers, room: rtRoom, error: rtError } = useRoomRealtime(gameState?.roomId || null);

  // Sincronizar cambios de Realtime hacia el estado de la aplicación
  useEffect(() => {
    if (rtRoom || rtPlayers.length > 0) {
      setGameState(prev => {
        if (!prev) return null;
        
        // Mapear RoomPlayer (DB) a Player (UI/Logic)
        const mappedPlayers: Player[] = rtPlayers.map(p => {
          // Intentamos mantener la mano local si es el jugador actual, 
          // ya que la mano completa no se sincroniza por seguridad/privacidad en cada cambio menor
          const existingPlayer = prev.players.find(ep => ep.id === p.id);
          return {
            id: p.id,
            name: p.name,
            lucas: p.lucas,
            isDealer: p.is_dealer,
            hand: existingPlayer?.hand || [], // En una implementación full, esto vendría de la DB también
            playedCards: existingPlayer?.playedCards || []
          };
        });

        return {
          ...prev,
          status: rtRoom?.status || prev.status,
          mode: rtRoom?.mode || prev.mode,
          players: mappedPlayers,
          pot: rtRoom?.pot || 0,
          currentRound: rtRoom?.current_round || 0,
          dealerId: rtRoom?.dealer_id || prev.dealerId
        };
      });
    }
  }, [rtRoom, rtPlayers]);

  // Helper to shuffle cards
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const createGame = async (playerName: string, mode: GameMode) => {
    try {
      // Llamada real a la API que creamos en fases anteriores
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, mode })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const deckWhite = shuffle(MODO_AULA_DECK_WHITE);
      const deckBlack = shuffle(MODO_AULA_DECK_BLACK);

      setGameState({
        roomId: data.roomCode,
        status: GameStatus.LOBBY,
        mode: mode,
        players: [
          {
            id: data.dealerPlayerId,
            name: playerName,
            lucas: INITIAL_LUCAS,
            hand: [],
            isDealer: true,
            playedCards: []
          }
        ],
        activeWhites: [],
        pot: 0,
        currentRound: 0,
        dealerId: data.dealerPlayerId,
        deckBlack: deckBlack,
        deckWhite: deckWhite
      });
      setCurrentPlayerId(data.dealerPlayerId);
    } catch (err: any) {
      alert(err.message || "Error al crear la sala. Intenta de nuevo.");
    }
  };

  const startRound = useCallback(() => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return null;
      
      const newStatus = GameStatus.PLAYING;
      const nextDealerIdx = (prev.currentRound) % prev.players.length;
      const dealer = prev.players[nextDealerIdx];
      
      const whites = prev.deckWhite.slice(0, 2);
      const remainingWhites = prev.deckWhite.slice(2);

      const updatedPlayers = prev.players.map(p => {
        const cardsToDraw = INITIAL_HAND_SIZE - p.hand.length;
        const newCards = prev.deckBlack.slice(0, cardsToDraw);
        return {
          ...p,
          hand: [...p.hand, ...newCards],
          isDealer: p.id === dealer.id,
          playedCards: []
        };
      });

      return {
        ...prev,
        status: newStatus,
        activeWhites: whites,
        deckWhite: remainingWhites,
        deckBlack: prev.deckBlack.slice(updatedPlayers.length * 5),
        players: updatedPlayers,
        dealerId: dealer.id,
        currentRound: prev.currentRound + 1
      };
    });
  }, [gameState]);

  const playCard = (cardId: string) => {
    if (!gameState || gameState.status !== GameStatus.PLAYING) return;
    
    setGameState(prev => {
      if (!prev) return null;
      const players = prev.players.map(p => {
        if (p.id === currentPlayerId && !p.isDealer) {
          const card = p.hand.find(c => c.id === cardId);
          if (card) {
            return {
              ...p,
              hand: p.hand.filter(c => c.id !== cardId),
              playedCards: [card]
            };
          }
        }
        return p;
      });

      // Simulación de IA para completar la ronda si no hay más humanos
      const updatedPlayers = players.map(p => {
        if (p.id !== currentPlayerId && !p.isDealer && p.playedCards.length === 0) {
          const randomIndex = Math.floor(Math.random() * p.hand.length);
          const card = p.hand[randomIndex];
          return {
            ...p,
            hand: p.hand.filter((_, i) => i !== randomIndex),
            playedCards: [card]
          };
        }
        return p;
      });

      const allPlayed = updatedPlayers.filter(p => !p.isDealer).every(p => p.playedCards.length > 0);
      
      return {
        ...prev,
        players: updatedPlayers,
        status: allPlayed ? GameStatus.REVEALING : GameStatus.PLAYING
      };
    });
  };

  const resolveRound = (winnerId: string, loserId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      let roundPot = prev.pot + prev.players.length;
      
      const updatedPlayers = prev.players.map(p => {
        let newLucas = p.lucas;
        let isWinner = p.id === winnerId;
        let isLoser = p.id === loserId;

        if (isWinner) newLucas += roundPot;
        if (isLoser) newLucas = Math.max(0, newLucas - 1);

        return { ...p, lucas: newLucas, isWinner, isLoser };
      });

      return {
        ...prev,
        status: GameStatus.RESOLVING,
        players: updatedPlayers,
        pot: 0
      };
    });

    setTimeout(() => {
      startRound();
    }, 4000);
  };

  const currentPlayer = gameState?.players.find(p => p.id === currentPlayerId);
  const isDealer = currentPlayer?.isDealer || false;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-zinc-950 text-white selection:bg-zinc-700">
      {rtError && (
        <div className="fixed top-4 left-4 right-4 z-[100] bg-red-500 text-white p-3 rounded-xl text-xs font-bold shadow-2xl animate-bounce">
          ⚠️ {rtError}
        </div>
      )}
      
      {!gameState ? (
        <SetupScreen onCreate={createGame} />
      ) : (
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <header className="flex justify-between items-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
            <div>
              <h1 className="text-xl font-bold tracking-tight">MALA LECHE <span className="text-zinc-500 font-normal">DIGITAL</span></h1>
              <p className="text-xs text-zinc-400">SALA: <span className="text-zinc-200 font-mono">{gameState.roomId}</span> | MODO: {gameState.mode}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-green-500 block">POZO: ${gameState.pot} LUCAS</span>
              <span className="text-xs text-zinc-500">RONDA {gameState.currentRound}</span>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <aside className="md:col-span-1">
              <PlayerList players={gameState.players} dealerId={gameState.dealerId} />
            </aside>

            <section className="md:col-span-3 flex flex-col gap-6">
              <div className="flex flex-wrap justify-center gap-4 p-6 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800 min-h-[200px]">
                {gameState.activeWhites.map(card => (
                  <GameCard key={card.id} card={card} isRevealed={true} />
                ))}
                {gameState.activeWhites.length === 0 && (
                  <div className="flex items-center justify-center h-full w-full">
                    <button 
                      onClick={startRound}
                      className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/10"
                    >
                      INICIAR PRIMERA RONDA
                    </button>
                  </div>
                )}
              </div>

              {gameState.status === GameStatus.REVEALING && (
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-center mb-6 text-zinc-400 uppercase tracking-widest text-sm font-bold">
                    {isDealer ? "¡Elige las mejores!" : "El Dealer está deliberando..."}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gameState.players.filter(p => !p.isDealer).map(p => (
                      <div key={p.id} className="relative">
                         <GameCard 
                          card={p.playedCards[0]} 
                          isRevealed={isDealer || gameState.status === GameStatus.RESOLVING} 
                          onClick={() => isDealer && resolveRound(p.id, gameState.players[0].id)}
                          className={isDealer ? "cursor-pointer hover:scale-105" : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gameState.status === GameStatus.RESOLVING && (
                 <div className="text-center p-12 bg-zinc-900 rounded-3xl border border-zinc-800 animate-bounce">
                    <h2 className="text-3xl font-black mb-4">
                      {gameState.players.find(p => p.isWinner)?.name} {CHILEAN_PHRASES.WIN_POT}
                    </h2>
                    <p className="text-zinc-400">Preparando siguiente ronda...</p>
                 </div>
              )}

              {gameState.status === GameStatus.PLAYING && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tu Mano</h3>
                    <div className="flex gap-2">
                       <button className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full text-zinc-300 hover:bg-zinc-700 transition-colors">Cambiar Mano (-1 Luca)</button>
                       <button className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full text-zinc-300 hover:bg-zinc-700 transition-colors">Doble Jugada (-2 Lucas)</button>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                    {currentPlayer?.hand.map(card => (
                      <GameCard 
                        key={card.id} 
                        card={card} 
                        isRevealed={true} 
                        selectable={!isDealer && !currentPlayer.playedCards.length}
                        onClick={() => playCard(card.id)}
                      />
                    ))}
                    {isDealer && (
                      <div className="flex-1 flex items-center justify-center p-12 bg-zinc-900 rounded-3xl border border-zinc-800 text-zinc-500 italic text-center">
                        {CHILEAN_PHRASES.DEALER_TURN}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      )}

      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
    </div>
  );
};

export default App;
