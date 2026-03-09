'use client';

import { AlertTriangle, Zap } from 'lucide-react';
import type { Position, CandleDirection } from '@/lib/types';

interface OperationsConsoleProps {
  currentPrice: number;
  position: Position | null;
  isRayoDorado: boolean;
  candleDirection: CandleDirection;
  handleStartHunt: () => void;
  calculatedLotSize?: number;
}

export function OperationsConsole({
  currentPrice,
  position,
  isRayoDorado,
  candleDirection,
  handleStartHunt,
  calculatedLotSize = 0
}: OperationsConsoleProps) {

  // Determinamos el color del botón según el estado
  const getButtonStyles = () => {
    if (!isRayoDorado) return 'bg-zinc-800 text-zinc-500 cursor-not-allowed';
    if (candleDirection === 'LONG') return 'bg-green-600 text-white animate-pulse';
    if (candleDirection === 'SHORT') return 'bg-red-600 text-white animate-pulse';
    return 'bg-yellow-500 text-black';
  };

  return (
    <div className="p-4 space-y-4 bg-black border-t border-zinc-800">

      {/* Alerta de Riesgo Simple */}
      <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded border border-zinc-800">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-[10px] text-zinc-400 font-mono uppercase">
          Riesgo Fijo: $80 USD
        </span>
      </div>

      {/* Botón de Acción Principal */}
      {!position ? (
        <button
          onClick={handleStartHunt}
          disabled={!isRayoDorado || currentPrice === 0}
          className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${getButtonStyles()}`}
        >
          <Zap className="w-4 h-4" />
          {isRayoDorado ? `INICIAR HUNT ${candleDirection}` : 'ESPERANDO SEÑAL'}
        </button>
      ) : (
        /* Info de la posición cuando está abierta */
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-zinc-900 rounded border border-zinc-800">
            <p className="text-[9px] text-zinc-500 uppercase">Entrada</p>
            <p className="text-sm font-bold text-white">${position.entryPrice.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded border border-zinc-800">
            <p className="text-[9px] text-green-500 uppercase">Target (TP)</p>
            <p className="text-sm font-bold text-green-500">${position.takeProfit.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}