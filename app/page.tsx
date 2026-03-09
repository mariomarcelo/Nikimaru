'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Para evitar errores de SSR
import { Zap, Clock } from 'lucide-react';
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

// CARGA SEGURA: Cargamos los componentes pesados solo en el cliente
const TradingChart = dynamic(() => import('@/components/trading-chart').then(mod => mod.TradingChart), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse flex items-center justify-center">Cargando Gráfico...</div>
});

const NikimaruChat = dynamic(() => import('@/components/nikimaru-chat').then(mod => mod.NikimaruChat), {
  ssr: false
});

const OperationsConsole = dynamic(() => import('@/components/operations-console').then(mod => mod.OperationsConsole), {
  ssr: false
});

export default function NikimaruApp() {
  // Estados básicos con valores iniciales seguros
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  // Funciones de control (Memoizadas para evitar re-renders infinitos)
  const handlePriceUpdate = useCallback((price: number) => setCurrentPrice(price), []);
  const handleHuellaChange = useCallback((active: boolean) => setIsHuellaActive(active), []);
  const handleDirectionChange = useCallback((dir: CandleDirection) => setCandleDirection(dir), []);

  return (
    <div className="min-h-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header Fijo */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Zap className="text-gold w-5 h-5 fill-gold" />
          <span className="font-black tracking-tighter text-lg">NIKIMARU</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono tracking-widest">
          TERMINAL_STATUS: <span className="text-green-500">ONLINE</span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Columna Izquierda: Gráfico y Consola */}
        <div className="flex-[3] flex flex-col gap-2">
          <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden relative">
            <TradingChart
              timeframe={activeTimeframe}
              isActive={true}
              position={position}
              onPriceUpdate={handlePriceUpdate}
              onHuellaChange={handleHuellaChange}
              onDirectionChange={handleDirectionChange}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              candleDirection={candleDirection}
            />
          </div>
          <div className="h-64 bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={isHuellaActive}
              onStartHunt={(pos) => setPosition(pos)}
              onClosePosition={() => setPosition(null)}
              position={position}
            />
          </div>
        </div>

        {/* Columna Derecha: IA Nikimaru */}
        <div className="w-[350px] bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <NikimaruChat
            currentPrice={currentPrice}
            isHuellaActive={isHuellaActive}
            timeframe={activeTimeframe}
          />
        </div>
      </main>
    </div>
  );
}