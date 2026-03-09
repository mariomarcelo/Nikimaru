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

  // Track HUELLA status per timeframe for multi-timeframe analysis
  const [huella1H, setHuella1H] = useState(false);
  const [huella1M, setHuella1M] = useState(false);

  // Track candle direction for directional illumination
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  // Flash message state
  const [showFlashMessage, setShowFlashMessage] = useState(false);
  const [lastFlashDirection, setLastFlashDirection] = useState<CandleDirection | null>(null);

  // RAYO DORADO: Definitive signal when 1M HUELLA is active
  // Major trend confirmation comes from 1H EMA
  const isRayoDorado = huella1M && activeTimeframe === '1m';

  // Handle price updates from chart
  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  // Handle HUELLA status changes per timeframe
  const handleHuellaChange = useCallback((active: boolean, tf: TimeFrame) => {
    setIsHuellaActive(active);
    if (tf === '1h') {
      setHuella1H(active);
    } else if (tf === '1m') {
      setHuella1M(active);
    }
  }, []);

  // Handle candle direction changes
  const handleDirectionChange = useCallback((direction: CandleDirection, tf: TimeFrame) => {
    if (tf === activeTimeframe) {
      setCandleDirection(direction);
    }
  }, [activeTimeframe]);

  // Handle position creation
  const handleStartHunt = useCallback((newPosition: Position) => {
    setPosition(newPosition);
  }, []);

  // Handle position close
  const handleClosePosition = useCallback(() => {
    setPosition(null);
  }, []);

  // Auto Break-Even logic
  useEffect(() => {
    if (!position || position.isBreakEven || currentPrice <= 0) return;

    const entryPrice = position.entryPrice;
    const stopLoss = position.stopLoss;
    const takeProfit = position.takeProfit;

    // Calculate 1:1 ratio price
    const riskDistance = Math.abs(entryPrice - stopLoss);
    let breakEvenTrigger: number;

    if (position.side === 'LONG') {
      breakEvenTrigger = entryPrice + riskDistance;

      if (currentPrice >= breakEvenTrigger) {
        setPosition({
          ...position,
          stopLoss: entryPrice,
          isBreakEven: true,
        });
      }
    } else {
      breakEvenTrigger = entryPrice - riskDistance;

      if (currentPrice <= breakEvenTrigger) {
        setPosition({
          ...position,
          stopLoss: entryPrice,
          isBreakEven: true,
        });
      }
    }
  }, [currentPrice, position]);

  // Show flash message when RAYO DORADO activates with direction
  useEffect(() => {
    if (isRayoDorado && candleDirection !== 'NEUTRAL' && candleDirection !== lastFlashDirection) {
      setShowFlashMessage(true);
      setLastFlashDirection(candleDirection);

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setShowFlashMessage(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isRayoDorado, candleDirection, lastFlashDirection]);

  // Reset flash direction when RAYO DORADO deactivates
  useEffect(() => {
    if (!isRayoDorado) {
      setLastFlashDirection(null);
    }
  }, [isRayoDorado]);

  // Check if position hit SL or TP
  useEffect(() => {
    if (!position || currentPrice <= 0) return;

    if (position.side === 'LONG') {
      if (currentPrice <= position.stopLoss) {
        alert(position.isBreakEven ? 'Break Even hit!' : 'Stop Loss hit!');
        setPosition(null);
      } else if (currentPrice >= position.takeProfit) {
        alert('Take Profit hit! +$160 profit!');
        setPosition(null);
      }
    } else {
      if (currentPrice >= position.stopLoss) {
        alert(position.isBreakEven ? 'Break Even hit!' : 'Stop Loss hit!');
        setPosition(null);
      } else if (currentPrice <= position.takeProfit) {
        alert('Take Profit hit! +$160 profit!');
        setPosition(null);
      }
    }
  }, [currentPrice, position]);

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
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

        {/* Timeframe Tabs - Large touch-friendly buttons */}
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chart and Controls */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Chart Area */}
          <div className="flex-1 relative min-h-[300px] lg:min-h-0">
            {TIMEFRAMES.map((tf) => (
              <div
                key={tf.value}
                className={`absolute inset-0 ${activeTimeframe === tf.value ? 'block' : 'hidden'
                  }`}
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

          {/* Operations Console - Sidebar on desktop, bottom on mobile */}
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

        {/* Right Panel - AI Chat */}
        <NikimaruChat
          currentPrice={currentPrice}
          isHuellaActive={isHuellaActive}
          timeframe={activeTimeframe}
        />
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          if (!position && currentPrice > 0) {
            const stopLossPercent = 1;
            const riskAmount = 80 - 0.80;
            const stopLossDistance = currentPrice * (stopLossPercent / 100);
            const lotSize = Math.floor((riskAmount / stopLossDistance) * 1000) / 1000;
            const sl = currentPrice - stopLossDistance;
            const tp = currentPrice + (stopLossDistance * 2);

            handleStartHunt({
              entryPrice: currentPrice,
              stopLoss: sl,
              takeProfit: tp,
              quantity: lotSize,
              side: 'LONG',
              isBreakEven: false,
            });
          }
        }}
        disabled={!!position}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all lg:hidden z-50 ${isRayoDorado && !position
            ? 'bg-gold animate-pulse-gold'
            : isHuellaActive && !position
              ? 'bg-gold/90'
              : 'bg-gold/60'
          } ${position ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
      >
        <Zap className="w-6 h-6 text-black" />
      </button>
    </div>
  );
}
