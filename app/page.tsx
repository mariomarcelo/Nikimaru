'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Zap, Clock, ShieldCheck, Target, TrendingUp } from 'lucide-react';
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
  // --- ESTADOS DE TRADING ---
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [huella1H, setHuella1H] = useState(false);
  const [huella1M, setHuella1M] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  const isRayoDorado = huella1M && activeTimeframe === '1m';

  // --- LÓGICA DE IA (CHAT FUSIONADO) ---
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      currentMarketData: {
        precio: currentPrice,
        huellaActiva: isHuellaActive,
        rayoDorado: isRayoDorado,
        temporalidad: activeTimeframe,
        direccionVela: candleDirection,
        tienesPosicion: !!position,
        detallesPosicion: position ? {
          entrada: position.entryPrice,
          lado: position.side,
          enBE: position.isBreakEven
        } : null
      }
    }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- HANDLERS DE TRADING ---
  const handlePriceUpdate = useCallback((price: number) => setCurrentPrice(price), []);
  const handleHuellaChange = useCallback((active: boolean, tf: TimeFrame) => {
    setIsHuellaActive(active);
    if (tf === '1h') setHuella1H(active);
    else if (tf === '1m') setHuella1M(active);
  }, []);
  const handleDirectionChange = useCallback((direction: CandleDirection, tf: TimeFrame) => {
    if (tf === activeTimeframe) setCandleDirection(direction);
  }, [activeTimeframe]);
  const handleStartHunt = useCallback((newPos: Position) => setPosition(newPos), []);
  const handleClosePosition = useCallback(() => setPosition(null), []);

  // --- AUTO BREAK-EVEN (PASO 3: BLINDAJE) ---
  useEffect(() => {
    if (!position || position.isBreakEven || currentPrice <= 0) return;
    const risk = Math.abs(position.entryPrice - position.stopLoss);
    const trigger = position.side === 'LONG' ? position.entryPrice + risk : position.entryPrice - risk;

    if ((position.side === 'LONG' && currentPrice >= trigger) || (position.side === 'SHORT' && currentPrice <= trigger)) {
      setPosition({ ...position, stopLoss: position.entryPrice, isBreakEven: true });
    }
  }, [currentPrice, position]);

  return (
    <div className="flex h-screen bg-black text-zinc-300 font-mono overflow-hidden">

      {/* PANEL IZQUIERDO: TERMINAL DE CAZA */}
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4">
            <Zap className={`w-6 h-6 ${isRayoDorado ? 'text-yellow-400 animate-pulse' : 'text-zinc-600'}`} />
            <h1 className="text-xl font-black tracking-tighter text-white">NIKIMARU <span className="text-cyan-500 text-xs">V3.0</span></h1>
          </div>

          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setActiveTimeframe(tf.value)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTimeframe === tf.value ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
          <TradingChart
            timeframe={activeTimeframe}
            isActive={true}
            position={position}
            onPriceUpdate={handlePriceUpdate}
            onHuellaChange={(active) => handleHuellaChange(active, activeTimeframe)}
            onDirectionChange={(dir) => handleDirectionChange(dir, activeTimeframe)}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
          />
        </div>

        <div className="h-64 border-t border-zinc-800 bg-zinc-950 p-6 flex gap-6">
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

      {/* PANEL DERECHO: MENTOR IA (PASO 1 & 5) */}
      <div className="w-96 flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHuellaActive ? 'bg-cyan-500 animate-ping' : 'bg-zinc-700'}`} />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mentor GenTrading</span>
          </div>
          {position?.isBreakEven && <ShieldCheck className="w-4 h-4 text-green-500" />}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <p className="text-xs">ESPERANDO HUELLA INSTITUCIONAL...</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] uppercase text-zinc-600 mb-1">{m.role === 'user' ? 'Cazador' : '🏛️ Mentor'}</span>
              <div className={`max-w-[90%] p-3 rounded-xl text-sm ${m.role === 'user'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-cyan-950/20 border border-cyan-900/30 text-cyan-50 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-zinc-800">
          <div className="relative">
            <input
              className="w-full bg-zinc-900 border border-zinc-800 p-3 pr-10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              value={input}
              placeholder="Analizá el volumen actual..."
              onChange={handleInputChange}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-cyan-600 hover:text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
