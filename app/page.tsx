'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { useChat } from

// COMPONENTES LOCALES
import { OperationsConsole } from '@/components/operations-console';
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

const TradingChart = dynamic(
  () => import('@/components/trading-chart').then((mod) => mod.TradingChart),
  {
    ssr: false,
    loading: () => <div className="flex-1 bg-black animate-pulse flex items-center justify-center text-zinc-800 text-xs">CARGANDO TERMINAL...</div>
  }
);

export default function NikimaruApp() {
  // 🛡️ GUARDIA DE HIDRATACIÓN
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isRayoDorado = isHuellaActive && activeTimeframe === '1m';

  // 🤖 MENTOR IA CON CONTEXTO
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      currentMarketData: {
        precio: currentPrice,
        huellaActiva: isHuellaActive,
        rayoDorado: isRayoDorado,
        temporalidad: activeTimeframe
      }
    }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ⚡ HANDLERS
  const handleStartHunt = useCallback(() => {

  }, [currentPrice, candleDirection]);

  // 🛑 PROTECCIÓN ANTI-CRASH
  if (!hasMounted) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <main className="flex h-screen bg-black text-white font-mono overflow-hidden">

      {/* PANEL IZQUIERDO: TRADING CORE */}
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 transition-all ${isRayoDorado ? 'text-yellow-400 animate-pulse' : 'text-zinc-600'}`} />
            <h1 className="text-lg font-black tracking-tighter">
              NIKIMARU <span className="text-[10px] text-yellow-500 italic ml-1">V3</span>
            </h1>
          </div>

          <div className="flex gap-1 bg-black p-1 rounded border border-zinc-800">
            {['1h', '15m', '1m'].map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf as TimeFrame)}
                className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${activeTimeframe === tf
                    ? 'bg-yellow-500 text-black'
                    : 'text-zinc-500 hover:text-white'
                  }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ÁREA DEL GRÁFICO (RENDERIZADO DINÁMICO) */}
        <div className="flex-1 relative bg-black">
          <TradingChart
            timeframe={activeTimeframe}
            isActive={true}
            position={position}
            onPriceUpdate={setCurrentPrice}
            onHuellaChange={setIsHuellaActive}
            onDirectionChange={setCandleDirection}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
          />
        </div>

        {/* CONSOLA DE OPERACIONES */}
        <div className="border-t border-zinc-800 bg-zinc-950/50">
          <OperationsConsole
            currentPrice={currentPrice}
            position={position}
            isRayoDorado={isRayoDorado}
            candleDirection={candleDirection}
            handleStartHunt={handleStartHunt}
          />
        </div>
      </div>

      {/* PANEL DERECHO: MENTOR AI */}
      <aside className="w-85 flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl">
        <div className="p-4 border-b border-zinc-800 bg-black flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isHuellaActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mentor GenTrading</span>
          </div>
          {position?.isBreakEven && <ShieldCheck className="w-4 h-4 text-green-500" />}
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-[10px] text-zinc-600 italic text-center mt-10">Esperando flujo de datos institucional...</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-lg text-[11px] leading-relaxed ${m.role === 'user'
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'bg-black border border-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.05)]'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-zinc-800">
          <div className="relative">
            <input
              className="w-full bg-zinc-900 border border-zinc-800 p-2.5 pr-10 rounded text-xs text-white focus:outline-none focus:border-yellow-500 transition-all"
              value={input}
              placeholder="¿Ves absorción en el bid?"
              onChange={handleInputChange}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-yellow-500 opacity-50 hover:opacity-100">
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </aside>
    </main>
  );
}