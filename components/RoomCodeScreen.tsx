
import React, { useState } from 'react';
import { GameMode } from '../types';

interface RoomCodeScreenProps {
  onRoomJoined: (data: { 
    roomId: string; 
    playerId: string; 
    name: string; 
    mode: GameMode;
    isDealer: boolean;
  }) => void;
}

const RoomCodeScreen: React.FC<RoomCodeScreenProps> = ({ onRoomJoined }) => {
  const [view, setView] = useState<'selection' | 'create' | 'join'>('selection');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<GameMode>(GameMode.AULA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name) {
      setError('Pon tu nombre primero, no seas barza.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mode }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al crear la mambo.');

      onRoomJoined({ 
        roomId: data.roomCode, 
        playerId: data.dealerPlayerId, 
        name, 
        mode,
        isDealer: true 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name || !roomCode) {
      setError('Llena todos los campos, gualtari.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rooms/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode, playerName: name }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'No pudimos entrar a la sala.');

      onRoomJoined({ 
        roomId: data.roomId, 
        playerId: data.player.id, 
        name, 
        mode: GameMode.AULA, // El modo real se sincronizará vía Realtime
        isDealer: false 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-all text-sm";
  const buttonClasses = "w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-white/5 uppercase tracking-tight";
  const secondaryBtn = "w-full py-4 bg-zinc-900 text-zinc-400 font-bold rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95";

  return (
    <div className="max-w-md w-full mt-10 md:mt-20 p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col gap-8 animate-in zoom-in-95 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tighter italic leading-none">MALA LECHE</h1>
        <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">Digital / Edición Aula</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl font-bold animate-shake">
          ⚠️ {error}
        </div>
      )}

      {view === 'selection' && (
        <div className="flex flex-col gap-3">
          <button onClick={() => setView('create')} className={buttonClasses}>Crear Nueva Sala</button>
          <button onClick={() => setView('join')} className={secondaryBtn}>Unirse a Sala</button>
        </div>
      )}

      {(view === 'create' || view === 'join') && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Tu Apodo</label>
              <input 
                type="text" 
                placeholder="Ej: El Profesor Galáctico"
                className={inputClasses}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {view === 'join' && (
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Código de Sala</label>
                <input 
                  type="text" 
                  placeholder="ABC123"
                  className={`${inputClasses} font-mono uppercase text-center text-lg tracking-widest`}
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {view === 'create' && (
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase mb-2 block tracking-widest px-1">Modo de Juego</label>
                <div className="grid grid-cols-2 gap-2">
                  {[GameMode.AULA, GameMode.NORMAL, GameMode.QUICK, GameMode.CASINO].map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`py-2 rounded-xl border text-[10px] font-black transition-all ${mode === m ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              disabled={loading || (view === 'join' && !roomCode) || !name}
              onClick={view === 'create' ? handleCreate : handleJoin}
              className={buttonClasses}
            >
              {loading ? 'Conectando...' : view === 'create' ? 'Armar la Mambo' : 'Entrar a la Sala'}
            </button>
            <button 
              onClick={() => { setView('selection'); setError(null); }} 
              className="text-[10px] text-zinc-500 font-bold hover:text-zinc-300 transition-colors uppercase tracking-widest"
            >
              ← Volver
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-y-2 pt-4 border-t border-zinc-800/50">
        <p className="text-[9px] text-zinc-600 uppercase font-medium leading-relaxed">
          Usa las cartas para educar o para <br/> 
          quedar como el lacho de la clase.
        </p>
      </div>
    </div>
  );
};

export default RoomCodeScreen;
