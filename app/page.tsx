'use client';

import { useState, useCallback } from 'react';
import { Zap, Clock } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import { NikimaruChat } from '@/components/nikimaru-chat';
import { useNikimaruAI } from '@/hooks/use-nikimaru-ai';
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
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  // Integración de la IA
  const { advice, isLoading } = useNikimaruAI({
    currentPrice,
    isHuellaActive,
    timeframe: activeTimeframe,
    candleDirection
  });

  const handlePriceUpdate = useCallback((price: number) => setCurrentPrice(price), []);
  const handleHuellaChange = useCallback((active: boolean) => setIsHuellaActive(active), []);
  const handleDirectionChange = useCallback((dir: CandleDirection) => setCandleDirection(dir), []);

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-gold" />
          <h1 className="text-lg font-bold">NIKIMARU</h1>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-4 py-2 text-xs font-bold rounded-lg ${activeTimeframe === tf.value ? 'bg-gold text-black' : 'text-muted-foreground'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" /> 2026-03-09
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 relative">
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
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={isHuellaActive}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              onStartHunt={(pos) => setPosition(pos)}
              onClosePosition={() => setPosition(null)}
              position={position}
            />
          </div>
        </div>

        {/* El Chat ahora recibe advice y isLoading */}
        <NikimaruChat
          currentPrice={currentPrice}
          isHuellaActive={isHuellaActive}
          timeframe={activeTimeframe}
          advice={advice}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}