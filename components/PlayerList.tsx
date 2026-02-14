
import React from 'react';
import { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  dealerId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, dealerId }) => {
  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-tighter">Jugadores</h2>
      </div>
      <div className="divide-y divide-zinc-800">
        {players.map(player => (
          <div key={player.id} className={`flex items-center justify-between p-4 ${player.isWinner ? 'bg-green-500/10' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${player.id === dealerId ? 'bg-yellow-500 text-black' : 'bg-zinc-700 text-zinc-300'}`}>
                {player.id === dealerId ? 'D' : player.name[0]}
              </div>
              <div>
                <span className="text-sm font-semibold block">{player.name}</span>
                {player.id === dealerId && <span className="text-[10px] text-yellow-500 font-bold uppercase">EL DEALER</span>}
                {player.playedCards.length > 0 && <span className="text-[10px] text-green-500 font-bold uppercase">LISTO</span>}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-400 block">${player.lucas}</span>
              <span className="text-[10px] text-zinc-600 uppercase">LUCAS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
