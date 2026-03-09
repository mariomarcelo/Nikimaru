'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import { NikimaruChat } from '@/components/nikimaru-chat';
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

  const handleStartHunt = useCallback((newPosition: Position) => {
    setPosition(newPosition);
  }, []);

  const handleClosePosition = useCallback(() => {
    setPosition(null);
  }, []);

  return (
    <div className="min-h-screen h-screen bg-black flex flex-col overflow-hidden text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gold/20 bg-black/50">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-gold" />
          <h1 className="text-md font-bold tracking-tighter">NIKIMARU TERMINAL</h1>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTimeframe === tf.value ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">BTC: ${currentPrice.toLocaleString()}</div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Gráfico y Consola (Izquierda y Centro) */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gold/10">
          <div className="flex-1 relative">
            {TIMEFRAMES.map((tf) => (
              <div key={tf.value} className={activeTimeframe === tf.value ? 'absolute inset-0 block' : 'hidden'}>
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

          {/* Consola de Operaciones Inferior */}
          <div className="h-48 border-t border-gold/10 bg-black/40 overflow-y-auto">
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

        {/* Panel de IA Nikimaru (DERECHA) */}
        <div className="w-80 flex flex-col bg-black/20 p-2">
          <NikimaruChat
            currentPrice={currentPrice}
            isHuellaActive={isHuellaActive}
            timeframe={activeTimeframe}
          />
        </div>

      </div>
    </div>
  );
}
