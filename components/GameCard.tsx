
import React from 'react';
import { Card, CardType } from '../types';

interface GameCardProps {
  card: Card;
  isRevealed?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ card, isRevealed = false, onClick, selectable, className = "" }) => {
  const isWhite = card.type === CardType.WHITE;
  
  const baseClasses = `
    relative w-40 h-56 p-4 rounded-xl shadow-xl transition-all duration-300 flex flex-col justify-between
    ${isWhite ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 border border-zinc-800 text-zinc-100'}
    ${selectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-95' : ''}
    ${!isRevealed ? 'bg-zinc-800 !text-transparent' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={selectable || onClick ? onClick : undefined}>
      {isRevealed ? (
        <>
          <p className={`text-sm font-semibold leading-snug ${isWhite ? 'text-zinc-900' : 'text-zinc-100'}`}>
            {card.text}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
              {isWhite ? 'Mala Leche' : 'Lacho'}
            </span>
            <div className={`w-2 h-2 rounded-full ${isWhite ? 'bg-zinc-900' : 'bg-zinc-100'} opacity-20`}></div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
           <div className="text-zinc-600 font-black text-4xl rotate-12 opacity-20">?</div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
