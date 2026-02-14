
import React, { useState } from 'react';
import { GameMode } from '../types';

interface SetupScreenProps {
  onCreate: (name: string, mode: GameMode) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>(GameMode.AULA);

  return (
    <div className="max-w-md w-full mt-20 p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col gap-8 animate-in zoom-in-95 duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tighter italic">MALA LECHE</h1>
        <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest">Edición Aula Digital</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Tu Apodo</label>
          <input 
            type="text" 
            placeholder="Ej: El Kevin"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Modo de Juego</label>
          <div className="grid grid-cols-2 gap-2">
            {[GameMode.NORMAL, GameMode.AULA, GameMode.QUICK, GameMode.CASINO].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${mode === m ? 'bg-white text-black border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        disabled={!name}
        onClick={() => onCreate(name, mode)}
        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-white/5"
      >
        CREAR SALA
      </button>

      <p className="text-[10px] text-zinc-600 text-center">Desarrollado con pura mala leche para fines educativos.</p>
    </div>
  );
};

export default SetupScreen;
