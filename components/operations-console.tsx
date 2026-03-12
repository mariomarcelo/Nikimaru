'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Shield, Target, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { TradeConfig, Position, CandleDirection } from '@/lib/types';

interface OperationsConsoleProps {
  currentPrice: number;
  isHuellaActive: boolean;
  isRayoDorado?: boolean;
  candleDirection?: CandleDirection;
  onStartHunt: (position: Position) => void;
  onClosePosition: () => void;
  position: Position | null;
}

const MAX_LOSS = 80; // $80 USD max loss
const COMMISSION = 0.80; // $0.80 USD commission

export function OperationsConsole({
  currentPrice,
  isHuellaActive,
  isRayoDorado = false,
  candleDirection = 'NEUTRAL',
  onStartHunt,
  onClosePosition,
  position,
}: OperationsConsoleProps) {
  const [config, setConfig] = useState<TradeConfig>({
    capital: 1000,
    leverage: 10,
    stopLossPrice: null,
    entryPrice: null,
    takeProfitPrice: null,
    maxLoss: MAX_LOSS,
    commission: COMMISSION,
  });

  const [stopLossPercent, setStopLossPercent] = useState<number>(1);
  const [calculatedLotSize, setCalculatedLotSize] = useState<number>(0);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

  // Calculate lot size based on risk management
  const calculateLotSize = useCallback(() => {
    if (!currentPrice || !stopLossPercent) return 0;

    const riskAmount = MAX_LOSS - COMMISSION;
    const stopLossDistance = currentPrice * (stopLossPercent / 100);
    const lotSize = riskAmount / stopLossDistance;

    return Math.floor(lotSize * 1000) / 1000;
  }, [currentPrice, stopLossPercent]);

  // Update lot size when parameters change
  useEffect(() => {
    const lot = calculateLotSize();
    setCalculatedLotSize(lot);
  }, [calculateLotSize]);

  // Calculate stop loss and take profit prices
  const calculatePrices = useCallback(() => {
    if (!currentPrice) return { sl: 0, tp: 0 };

    const slDistance = currentPrice * (stopLossPercent / 100);

    if (side === 'LONG') {
      const sl = currentPrice - slDistance;
      const tp = currentPrice + (slDistance * 2); // 1:2 RR
      return { sl, tp };
    } else {
      const sl = currentPrice + slDistance;
      const tp = currentPrice - (slDistance * 2); // 1:2 RR
      return { sl, tp };
    }
  }, [currentPrice, stopLossPercent, side]);

  const { sl, tp } = calculatePrices();

  // Handle Start Hunt
  const handleStartHunt = () => {
    if (!currentPrice || calculatedLotSize <= 0) return;

    const newPosition: Position = {
      entryPrice: currentPrice,
      stopLoss: sl,
      takeProfit: tp,
      quantity: calculatedLotSize,
      side,
      isBreakEven: false,
    };

    onStartHunt(newPosition);
  };

  // Format price display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-gold" />
          OPERATIONS CONSOLE
        </h3>
        <div
          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${isRayoDorado && candleDirection === 'LONG'
              ? 'bg-bull/30 text-bull border border-bull/50 shadow-lg shadow-bull/30'
              : isRayoDorado && candleDirection === 'SHORT'
                ? 'bg-bear/30 text-bear border border-bear/50 shadow-lg shadow-bear/30'
                : isRayoDorado
                  ? 'bg-gold/30 text-gold animate-pulse-gold border border-gold/50'
                  : isHuellaActive
                    ? 'bg-gold/20 text-gold animate-glow-gold'
                    : 'bg-secondary text-muted-foreground'
            }`}
        >
          {isRayoDorado && candleDirection === 'LONG' ? 'HUNT LONG'
            : isRayoDorado && candleDirection === 'SHORT' ? 'HUNT SHORT'
              : isRayoDorado ? 'ESPERANDO'
                : isHuellaActive ? 'HUELLA ACTIVE' : 'HUELLA INACTIVE'}
        </div>
      </div>

      {/* Position Side Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide('LONG')}
          className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${side === 'LONG'
              ? 'bg-bull text-black'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
        >
          LONG
        </button>
        <button
          onClick={() => setSide('SHORT')}
          className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${side === 'SHORT'
              ? 'bg-bear text-white'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
        >
          SHORT
        </button>
      </div>

      {/* Capital Input */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">CAPITAL (USD)</label>
        <Input
          type="number"
          value={config.capital}
          onChange={(e) => setConfig({ ...config, capital: Number(e.target.value) })}
          className="bg-secondary border-border text-foreground"
          min={0}
        />
      </div>

      {/* Leverage Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">LEVERAGE</label>
          <span className="text-sm font-bold text-gold">{config.leverage}x</span>
        </div>
        <Slider
          value={[config.leverage]}
          onValueChange={(value) => setConfig({ ...config, leverage: value[0] })}
          min={1}
          max={125}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1x</span>
          <span>25x</span>
          <span>50x</span>
          <span>75x</span>
          <span>100x</span>
          <span>125x</span>
        </div>
      </div>

      {/* Stop Loss Distance */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-muted-foreground">STOP LOSS DISTANCE</label>
          <span className="text-sm font-bold text-bear">{stopLossPercent.toFixed(2)}%</span>
        </div>
        <Slider
          value={[stopLossPercent]}
          onValueChange={(value) => setStopLossPercent(value[0])}
          min={0.1}
          max={5}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Risk Calculation Display - Border illuminates based on direction */}
      <div className={`p-3 bg-secondary/50 rounded-lg space-y-2 border-2 transition-all duration-300 ${isRayoDorado && candleDirection === 'LONG'
          ? 'border-bull shadow-lg shadow-bull/20'
          : isRayoDorado && candleDirection === 'SHORT'
            ? 'border-bear shadow-lg shadow-bear/20'
            : isRayoDorado
              ? 'border-gold/50'
              : 'border-transparent'
        }`}>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Entry Price:</span>
          <span className="text-gold font-bold">${formatPrice(currentPrice)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Stop Loss:</span>
          <span className="text-bear font-bold">${formatPrice(sl)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Take Profit (1:2):</span>
          <span className="text-bull font-bold">${formatPrice(tp)}</span>
        </div>
        <div className="border-t border-border pt-2 mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Calculated Lot Size:</span>
            <span className="text-foreground font-bold">{calculatedLotSize.toFixed(4)} BTC</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Max Loss (incl. fee):</span>
            <span className="text-bear font-bold">${MAX_LOSS.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Commission:</span>
            <span className="text-muted-foreground">${COMMISSION.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="flex items-center gap-2 p-2 bg-bear/10 rounded-md">
        <AlertTriangle className="w-4 h-4 text-bear flex-shrink-0" />
        <span className="text-xs text-bear">
          Max loss fixed at $80 USD per trade
        </span>
      </div>

      {/* Action Buttons */}
      {!position ? (
        <button
          onClick={handleStartHunt}
          disabled={!currentPrice || calculatedLotSize <= 0}
          className={`relative w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-95 ${isRayoDorado && candleDirection === 'LONG'
              ? 'bg-bull text-white shadow-lg shadow-bull/40'
              : isRayoDorado && candleDirection === 'SHORT'
                ? 'bg-bear text-white shadow-lg shadow-bear/40'
                : isRayoDorado
                  ? 'bg-gold text-black animate-pulse-gold shadow-lg shadow-gold/40'
                  : isHuellaActive
                    ? 'bg-gold text-black'
                    : 'bg-gold/70 text-black hover:bg-gold'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Zap className="w-5 h-5" />
          {isRayoDorado && candleDirection === 'LONG' ? 'HUNT LONG'
            : isRayoDorado && candleDirection === 'SHORT' ? 'HUNT SHORT'
              : isRayoDorado ? 'ESPERANDO DIRECCION'
                : 'START HUNT'}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-bull/10 rounded-md">
            <Shield className="w-4 h-4 text-bull flex-shrink-0" />
            <span className="text-xs text-bull">
              {position.isBreakEven ? 'BREAK EVEN ACTIVE' : 'POSITION OPEN'}
            </span>
          </div>
          <button
            onClick={onClosePosition}
            className="w-full py-3 rounded-lg font-bold bg-bear text-white hover:bg-bear/80 transition-all"
          >
            CLOSE POSITION
          </button>
        </div>
      )}
    </div>
  );
}
