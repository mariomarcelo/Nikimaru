'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { useChat } from '@ai-sdk/react'; // Corregido a la nueva ruta
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '15m', label: '15M' },
  { value: '1m', label: '1M' },
];

export default function NikimaruApp() {
  // --- ESTADOS ---
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [huella1M, setHuella1M] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  const isRayoDorado = huella1M && activeTimeframe === '1m';

  // --- LÓGICA DE IA ---
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      currentMarketData: {
        precio: currentPrice,
        huellaActiva: isHuellaActive,
        rayoDorado: isRayoDorado,
        temporalidad: activeTimeframe,
      }
    }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- HANDLERS ---
  const handlePriceUpdate = useCallback((price: number) => setCurrentPrice(price), []);

  const handleHuellaChange = useCallback((active: boolean) => {
    setIsHuellaActive(active);
    if (activeTimeframe === '1m') setHuella1M(active);
  }, [activeTimeframe]);

  const handleDirectionChange = useCallback((direction: CandleDirection) => {
    setCandleDirection(direction);
  }, []);

  // Handlers para la consola
  const handleStartHunt = useCallback(() => {
    // Lógica básica para abrir posición
    const mockPosition: Position = {
      entryPrice: currentPrice,
      stopLoss: currentPrice * 0.99,
      takeProfit: currentPrice * 1.02,
      side: candleDirection === 'SHORT' ? 'SHORT' : 'LONG',
      isBreakEven: false
    };
    setPosition(mockPosition);
  }, [currentPrice, candleDirection]);

  return (
    <div className="flex h-screen bg-black text-zinc-300 font-mono overflow-hidden">

      {/* PANEL IZQUIERDO: CHART & CONSOLE */}
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4">
            <Zap className={`w-6 h-6 ${isRayoDorado ? 'text-yellow-400 animate-pulse' : 'text-zinc-600'}`} />
            <h1 className="text-xl font-black tracking-tighter text-white">NIKIMARU</h1>
          </div>

          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setActiveTimeframe(tf.value)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTimeframe === tf.value ? 'bg-yellow-500 text-black' : 'text-zinc-500'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </header>

        {/* Gráfico */}
        <div className="flex-1 relative bg-black">
          <TradingChart
            timeframe={activeTimeframe}
            isActive={true}
            position={position}
            onPriceUpdate={handlePriceUpdate}
            onHuellaChange={handleHuellaChange}
            onDirectionChange={handleDirectionChange}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
          />
        </div>

        {/* Consola de Operaciones */}
        <div className="h-48 border-t border-zinc-800 bg-black">
          <OperationsConsole
            currentPrice={currentPrice}
            position={position}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
            handleStartHunt={handleStartHunt}
          />
        </div>
      </div>

      {/* PANEL DERECHO: CHAT */}
      <div className="w-80 flex flex-col bg-zinc-950 border-l border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mentor AI</span>
          {position?.isBreakEven && <ShieldCheck className="w-4 h-4 text-green-500" />}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-2 rounded text-xs ${m.role === 'user' ? 'bg-zinc-800' : 'bg-zinc-900 text-yellow-500 border border-yellow-500/20'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-black">
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white"
            value={input}
            onChange={handleInputChange}
            placeholder="Analizar mercado..."
          />
        </form>
      </div>
    </div>
  );
}