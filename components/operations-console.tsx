'use client';

import { AlertTriangle, Target, Zap } from 'lucide-react';
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

  return (
    <div className="p-4 space-y-4 bg-black border-t border-border">
      {/* Risk Warning - Usando color destructive del CSS */}
      <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md border border-destructive/20">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        <span className="text-[10px] text-destructive font-mono uppercase tracking-wider">
          Riesgo Protegido: Max loss $80 USD
        </span>
      </div>

      {/* Action Buttons */}
      {!position ? (
        <button
          onClick={handleStartHunt}
          disabled={!currentPrice || (calculatedLotSize <= 0 && !isRayoDorado)}
          className={`relative w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border-2 ${isRayoDorado && candleDirection === 'LONG'
              ? 'bg-bull border-bull text-black shadow-[0_0_20px_rgba(0,200,83,0.4)]'
              : isRayoDorado && candleDirection === 'SHORT'
                ? 'bg-bear border-bear text-white shadow-[0_0_20px_rgba(220,20,60,0.4)]'
                : isRayoDorado
                  ? 'bg-gold border-gold text-black animate-pulse-gold'
                  : 'bg-secondary border-border text-muted-foreground cursor-not-allowed opacity-50'
            }`}
        >
          <Zap className={`w-5 h-5 ${isRayoDorado ? 'fill-current' : ''}`} />
          <span className="tracking-tighter uppercase">
            {isRayoDorado ? `INICIAR CAZA ${candleDirection}` : 'ESPERANDO SEÑAL INSTITUCIONAL'}
          </span>
        </button>
      ) : (
        /* Vista cuando hay una posición activa */
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-bull animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Operación en curso</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="text-[9px] text-muted-foreground uppercase font-mono">Entrada</div>
              <div className="text-sm font-bold text-foreground tabular-nums">
                ${position.entryPrice.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="text-[9px] text-bull uppercase font-mono">Objetivo (TP)</div>
              <div className="text-sm font-bold text-bull tabular-nums">
                ${position.takeProfit.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="p-3 bg-card rounded-lg border border-bear/30">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-bear uppercase font-mono">Stop Loss</span>
              {position.isBreakEven && (
                <span className="text-[8px] bg-bull/20 text-bull px-1 rounded">BE ACTIVADO</span>
              )}
            </div>
            <div className="text-sm font-bold text-bear tabular-nums">
              ${position.stopLoss.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}