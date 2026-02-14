
import React, { useState, useEffect } from 'react';

interface RoundRecord {
  round_number: number;
  white_cards: string[];
  winner_name: string;
  loser_name: string;
  pot_awarded: number;
  dealer_name: string;
}

interface PlayerStat {
  name: string;
  wins: number;
  losses: number;
  total_lucas: number;
}

interface GameHistoryModalProps {
  roomId: string;
  onClose: () => void;
}

const GameHistoryModal: React.FC<GameHistoryModalProps> = ({ roomId, onClose }) => {
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Nota: Este endpoint debe ser implementado en el backend
        const response = await fetch(`/api/history/stats?roomId=${roomId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'No pudimos cargar el historial.');
        
        setHistory(data.history || []);
        setStats(data.stats || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [roomId]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-900 max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabecera */}
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Bitácora de la Mambo</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sala: {roomId}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest">Buscando en los archivos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-bold">⚠️ {error}</p>
              <button onClick={onClose} className="mt-4 text-xs text-zinc-400 underline uppercase tracking-widest">Cerrar</button>
            </div>
          ) : (
            <>
              {/* Sección de Estadísticas */}
              <section>
                <h3 className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-[0.2em]">Ránking de Jugosos</h3>
                <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-800">
                        <th className="px-4 py-3 font-bold text-zinc-400">Jugador</th>
                        <th className="px-4 py-3 font-bold text-zinc-400 text-center">Wins</th>
                        <th className="px-4 py-3 font-bold text-zinc-400 text-center">Lachos</th>
                        <th className="px-4 py-3 font-bold text-zinc-400 text-right">Lucas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {stats.map((s, i) => (
                        <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-zinc-200">{s.name}</td>
                          <td className="px-4 py-3 text-center text-green-500 font-black">{s.wins}</td>
                          <td className="px-4 py-3 text-center text-red-500 font-black">{s.losses}</td>
                          <td className="px-4 py-3 text-right font-mono text-yellow-500">${s.total_lucas}</td>
                        </tr>
                      ))}
                      {stats.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-600 italic">No hay datos todavía.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Últimas Rondas */}
              <section>
                <h3 className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-[0.2em]">Últimas 10 Rondas</h3>
                <div className="space-y-3">
                  {history.map((round, idx) => (
                    <div key={idx} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Ronda {round.round_number}</span>
                        <span className="text-[10px] font-bold text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded-full">+{round.pot_awarded} Lucas</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-300">
                        Dealer: <span className="text-white font-bold">{round.dealer_name}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                          <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1">Ganador</span>
                          <span className="text-xs font-bold text-zinc-200">{round.winner_name}</span>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                          <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1">Lacho (Perdedor)</span>
                          <span className="text-xs font-bold text-red-400">{round.loser_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-8 bg-zinc-950 rounded-2xl border border-zinc-800 border-dashed">
                      <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Nada que mostrar aún...</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Pie */}
        <div className="p-8 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5 uppercase tracking-tighter"
          >
            Volver al Mambo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameHistoryModal;
