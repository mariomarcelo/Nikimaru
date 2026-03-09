'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { useChat } from 'ai/react';
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
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  // El Rayo Dorado se activa si hay huella en 1m
  const isRayoDorado = isHuellaActive && activeTimeframe === '1m';

  const { messages, input, handleInputChange, handleSubmit } = useChat();

  // Handlers para conectar con TradingChart
  const handlePriceUpdate = (p: number) => setCurrentPrice(p);
  const handleHuella = (a: boolean) => setIsHuellaActive(a);
  const handleDir = (d: CandleDirection) => setCandleDirection(d);

  // Handler para la consola (Nombre sincronizado con OperationsConsole)
  const handleStartHunt = () => {
    if (!currentPrice) return;
    setPosition({
      entryPrice: currentPrice,
      stopLoss: currentPrice * 0.99,
      takeProfit: currentPrice * 1.01,
      side: candleDirection === 'SHORT' ? 'SHORT' : 'LONG',
      isBreakEven: false
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-mono overflow-hidden">
      {/* PANEL IZQUIERDO */}
      <div className="flex-1 flex flex-col border-r border-border">
        <header className="p-4 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${isRayoDorado ? 'text-gold animate-pulse-gold' : 'text-muted-foreground'}`} />
            <h1 className="font-black tracking-tighter">NIKIMARU V3</h1>
          </div>
          <div className="flex gap-2 bg-secondary p-1 rounded-md">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setActiveTimeframe(tf.value)}
                className={`px-3 py-1 text-[10px] font-bold rounded ${activeTimeframe === tf.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 bg-background relative">
          <TradingChart
            timeframe={activeTimeframe}
            isActive={true}
            position={position}
            onPriceUpdate={handlePriceUpdate}
            onHuellaChange={handleHuella}
            onDirectionChange={handleDir}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
          />
        </div>

        <div className="border-t border-border">
          <OperationsConsole
            currentPrice={currentPrice}
            position={position}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
            handleStartHunt={handleStartHunt}
          />
        </div>
      </div>

      {/* PANEL DERECHO (CHAT) */}
      <div className="w-80 flex flex-col bg-card border-l border-border">
        <div className="p-4 border-b border-border bg-black flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Mentor AI</span>
          {position?.isBreakEven && <ShieldCheck className="w-4 h-4 text-bull" />}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-2 rounded text-xs ${m.role === 'user' ? 'bg-secondary' : 'bg-black border border-primary/20 text-primary animate-glow-gold'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-black">
          <input
            className="w-full bg-input border border-border p-2 rounded text-xs outline-none focus:ring-1 focus:ring-primary"
            value={input}
            onChange={handleInputChange}
            placeholder="Analizar volumen..."
          />
        </form>
      </div>
    </div>
  );
}