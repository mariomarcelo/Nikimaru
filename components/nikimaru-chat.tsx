'use client';

import { Bot, Zap } from 'lucide-react';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
  advice: string;      // Prop nueva
  isLoading: boolean;  // Prop nueva
}

export function NikimaruChat({ currentPrice, isHuellaActive, timeframe, advice, isLoading }: NikimaruChatProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full font-mono">
      <div className="p-4 border-b border-border flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Nikimaru AI</span>
        </div>
        {isHuellaActive && <Zap className="w-3 h-3 text-gold animate-pulse" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-[10px] text-zinc-500 border-b border-zinc-800 pb-2">
          SISTEMA: ONLINE | TF: {timeframe} | PRICE: {currentPrice}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-gold animate-pulse text-xs">
            <span className="text-lg">⚡</span>
            <span>ANALIZANDO HUELLA...</span>
          </div>
        ) : (
          <div className="text-xs leading-relaxed text-zinc-300 italic">
            {advice || "Escaneando el flujo de órdenes institucional en busca de anomalías..."}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 text-[9px] text-zinc-600 uppercase">
        Status: {isHuellaActive ? 'Detecting Whales' : 'Monitoring Retail'}
      </div>
    </div>
  );
}