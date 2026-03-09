'use client';

import { AlertTriangle, Target, Zap } from 'lucide-react';
import type { Position, CandleDirection } from '@/lib/types';

interface OperationsConsoleProps {
  currentPrice: number;
  position: Position | null;
  isRayoDorado: boolean;
  candleDirection: CandleDirection;
  handleStartHunt: () => void;
  // Añadimos estas si faltaban:
  calculatedLotSize?: number;
}

export function OperationsConsole({
  currentPrice,
  position,
  isRayoDorado,
  candleDirection,
  handleStartHunt,
  calculatedLotSize = 0 // Valor por defecto para evitar errores
}: OperationsConsoleProps) {

  return (
    <div className="p-4 space-y-4 bg-black border-t border-zinc-800">
      {/* Risk Warning */}
      <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-md">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <span className="text-xs text-red-500 font-mono">
          Max loss fixed at $80 USD per trade
        </span>
      </div>

      {/* Action Buttons */}
      {!position ? (
        <button
          onClick={handleStartHunt}
          disabled={!currentPrice || calculatedLotSize <= 0}
          className={`relative w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isRayoDorado && candleDirection === 'LONG'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/40'
              : isRayoDorado && candleDirection === 'SHORT'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                : isRayoDorado
                  ? 'bg-yellow-500 text-black animate-pulse'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
        >
          <Zap className={`w-5 h-5 ${isRayoDorado ? 'fill-current' : ''}`} />
          {isRayoDorado ? `START ${candleDirection} HUNT` : 'WAITING FOR SIGNAL'}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Entry</div>
            <div className="text-sm font-bold text-white">${position.entryPrice}</div>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase">Target (TP)</div>
            <div className="text-sm font-bold text-green-500">${position.takeProfit}</div>
          </div>
        </div>
      )}
    </div>
  );
}
