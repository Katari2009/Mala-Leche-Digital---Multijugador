
import React from 'react';

interface ManualModalProps {
  onClose: () => void;
}

const ManualModal: React.FC<ManualModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 max-w-lg w-full p-8 rounded-[2rem] border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-black mb-6 border-b border-zinc-800 pb-4 italic">CÓMO JUGAR (EN 3 PASOS)</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white border border-zinc-700">1</div>
            <div>
              <h3 className="font-bold text-lg">El Dealer Tira</h3>
              <p className="text-zinc-400 text-sm">El Dealer de la ronda revela cartas blancas (preguntas/situaciones). Los demás eligen su mejor carta negra para responder.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white border border-zinc-700">2</div>
            <div>
              <h3 className="font-bold text-lg">La Revelación</h3>
              <p className="text-zinc-400 text-sm">Las cartas se revelan de forma anónima. El Dealer elige la mejor (gana) y la peor (paga multa).</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white border border-zinc-700">3</div>
            <div>
              <h3 className="font-bold text-lg">Las Lucas</h3>
              <p className="text-zinc-400 text-sm">Ganar te da el pozo de LUCAS. Perder te cuesta 1 LUCA. ¡Úsalas para cambiar tu mano o jugar doble!</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full py-4 bg-zinc-100 text-black font-black rounded-2xl hover:bg-white transition-all active:scale-95"
        >
          ¡YA ENTENDÍ, VAMOS!
        </button>
      </div>
    </div>
  );
};

export default ManualModal;
