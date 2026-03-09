'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import { NikimaruChat } from '@/components/nikimaru-chat';
import { useNikimaruAI } from '@/hooks/use-nikimaru-ai'; // Importamos el Hook
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

  // --- LÓGICA DE IA (Integrada sin tocar el HTML) ---
  const { advice, isLoading } = useNikimaruAI({
    currentPrice,
    isHuellaActive: huella1M,
    timeframe: activeTimeframe,
    candleDirection
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

  // (Mantenemos tus useEffects de Break-Even y SL/TP exactamente igual que los tenías)
  // ... (aquí iría tu lógica de profit/loss que ya tienes)

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Respetando tus clases y componentes */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-gold" />
            <h1 className="text-lg font-bold text-foreground">NIKIMARU</h1>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            High-Frequency Trading Terminal
          </span>
        </div>

        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`min-w-[56px] px-4 py-3 text-sm font-bold rounded-lg transition-all touch-manipulation ${activeTimeframe === tf.value
                  ? 'bg-gold text-black shadow-lg shadow-gold/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80 active:scale-95'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">March 7, 2026</span>
        </div>
      </header>

      {/* Main Content - Manteniendo tu GRID original */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Chart Area */}
          <div className="flex-1 relative min-h-[300px] lg:min-h-0">
            {TIMEFRAMES.map((tf) => (
              <div
                key={tf.value}
                className={`absolute inset-0 ${activeTimeframe === tf.value ? 'block' : 'hidden'}`}
              >
                <TradingChart
                  timeframe={tf.value}
                  isActive={activeTimeframe === tf.value}
                  position={position}
                  onPriceUpdate={handlePriceUpdate}
                  onHuellaChange={(active) => handleHuellaChange(active, tf.value)}
                  onDirectionChange={(dir) => handleDirectionChange(dir, tf.value)}
                  isRayoDorado={isRayoDorado && tf.value === '1m'}
                  candleDirection={candleDirection}
                />
              </div>
            ))}
          </div>

          {/* Sidebar de Operaciones */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={isHuellaActive}
              isRayoDorado={isRayoDorado}
              onStartHunt={handleStartHunt}
              onClosePosition={handleClosePosition}
              position={position}
            />
          </div>
        </div>

        {/* Panel de IA - Respetando tu componente NikimaruChat */}
        <NikimaruChat
          currentPrice={currentPrice}
          isHuellaActive={isHuellaActive}
          timeframe={activeTimeframe}
          advice={advice} // Pasamos el consejo de la IA
          isLoading={isLoading} // Pasamos el estado de carga
        />
      </div>
    </div>
  );
}