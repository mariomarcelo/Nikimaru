'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
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

  const isRayoDorado = huella1M && activeTimeframe === '1m';

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const handleHuellaChange = useCallback((active: boolean, tf: TimeFrame) => {
    if (tf === '1h') setHuella1H(active);
    else if (tf === '1m') setHuella1M(active);

    if (tf === activeTimeframe) {
      setIsHuellaActive(active);
    }
  }, [activeTimeframe]);

  const handleDirectionChange = useCallback((direction: CandleDirection, tf: TimeFrame) => {
    if (tf === activeTimeframe) {
      setCandleDirection(direction);
    }
  }, [activeTimeframe]);

  const handleStartHunt = useCallback((newPosition: Position) => {
    setPosition(newPosition);
  }, []);

  const handleClosePosition = useCallback(() => {
    setPosition(null);
  }, []);

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden text-foreground uppercase font-mono">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
            <h1 className="text-lg font-bold tracking-tighter">NIKIMARU</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1.5 border border-border">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`min-w-[56px] px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTimeframe === tf.value
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2">
        {/* Chart Area */}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0 rounded-2xl border border-border bg-black overflow-hidden shadow-2xl">
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

        {/* Sidebar / Console */}
        <div className="lg:w-80 h-full flex flex-col gap-2">
          <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
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
      </div>
    </div>
  );
}