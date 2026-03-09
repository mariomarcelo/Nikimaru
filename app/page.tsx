'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Clock, BrainCircuit } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import { NikimaruChat } from '@/components/nikimaru-chat';
import { NikimaruTerminal } from '@/components/nikimaru-terminal'; // Componente visual
import { useNikimaruAI } from '@/hooks/use-nikimaru-ai'; // Tu nuevo Hook
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '15m', label: '15M' },
  { value: '1m', label: '1M' },
];

export default function NikimaruApp() {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const [huella1H, setHuella1H] = useState(false);
  const [huella1M, setHuella1M] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');
  const [showFlashMessage, setShowFlashMessage] = useState(false);
  const [lastFlashDirection, setLastFlashDirection] = useState<CandleDirection | null>(null);

  const isRayoDorado = huella1M && activeTimeframe === '1m';

  // --- INTEGRACIÓN DE INTELIGENCIA ARTIFICIAL ---
  const { advice, isLoading } = useNikimaruAI({
    currentPrice,
    isHuellaActive: huella1M, // Priorizamos la huella de 1M para el Rayo
    timeframe: activeTimeframe,
    candleDirection: candleDirection
  });

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const handleHuellaChange = useCallback((active: boolean, tf: TimeFrame) => {
    setIsHuellaActive(active);
    if (tf === '1h') setHuella1H(active);
    else if (tf === '1m') setHuella1M(active);
  }, []);

  const handleDirectionChange = useCallback((direction: CandleDirection, tf: TimeFrame) => {
    if (tf === activeTimeframe) setCandleDirection(direction);
  }, [activeTimeframe]);

  const handleStartHunt = useCallback((newPosition: Position) => setPosition(newPosition), []);
  const handleClosePosition = useCallback(() => setPosition(null), []);

  // Lógica de Auto Break-Even (Mantenida intacta)
  useEffect(() => {
    if (!position || position.isBreakEven || currentPrice <= 0) return;
    const { entryPrice, stopLoss, side } = position;
    const riskDistance = Math.abs(entryPrice - stopLoss);

    if (side === 'LONG' && currentPrice >= entryPrice + riskDistance) {
      setPosition({ ...position, stopLoss: entryPrice, isBreakEven: true });
    } else if (side === 'SHORT' && currentPrice <= entryPrice - riskDistance) {
      setPosition({ ...position, stopLoss: entryPrice, isBreakEven: true });
    }
  }, [currentPrice, position]);

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-gold animate-pulse" />
          <h1 className="text-lg font-bold tracking-tighter text-foreground">NIKIMARU <span className="text-gold/50 text-[10px]">OS</span></h1>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1 border border-white/5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTimeframe === tf.value ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-muted-foreground'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
          <div className={`w-2 h-2 rounded-full ${huella1M ? 'bg-gold animate-glow' : 'bg-zinc-800'}`} />
          Institutional Trace: {huella1M ? 'Detected' : 'Searching'}
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-2 gap-2">

        {/* Gráfico (Col 1-8) */}
        <div className="col-span-12 lg:col-span-8 relative rounded-2xl border border-border overflow-hidden bg-black shadow-inner">
          {TIMEFRAMES.map((tf) => (
            <div key={tf.value} className={`absolute inset-0 ${activeTimeframe === tf.value ? 'block' : 'hidden'}`}>
              <TradingChart
                timeframe={tf.value}
                isActive={activeTimeframe === tf.value}
                position={position}
                onPriceUpdate={handlePriceUpdate}
                onHuellaChange={(active) => handleHuellaChange(active, tf.value)}
                onDirectionChange={(dir) => handleDirectionChange(dir, tf.value)}
                isRayoDorado={isRayoDorado}
                candleDirection={candleDirection}
              />
            </div>
          ))}
        </div>

        {/* Panel de Control e Inteligencia (Col 9-12) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 overflow-hidden">

          {/* Terminal de Nikimaru (IA) */}
          <div className="flex-[1.5] min-h-[200px]">
            <NikimaruTerminal
              advice={advice}
              isLoading={isLoading}
              isHuellaActive={huella1M}
            />
          </div>

          {/* Consola de Operaciones */}
          <div className="flex-1 border border-border rounded-2xl overflow-y-auto bg-card/30">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={huella1M}
              isRayoDorado={isRayoDorado}
              onStartHunt={handleStartHunt}
              onClosePosition={handleClosePosition}
              position={position}
            />
          </div>
        </div>
      </div>

      {/* Rayo Dorado Flash Alert */}
      {showFlashMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in duration-300">
          <div className={`px-6 py-3 rounded-full border-2 shadow-2xl font-black text-xl flex items-center gap-3 ${candleDirection === 'LONG' ? 'bg-bull/20 border-bull text-bull' : 'bg-bear/20 border-bear text-bear'
            }`}>
            <Zap className="fill-current" /> RAYO DORADO: {candleDirection}
          </div>
        </div>
      )}
    </div>
  );
}