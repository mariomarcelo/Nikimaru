'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Zap, Clock } from 'lucide-react';

// TIPOS
type TimeFrame = '1m' | '15m' | '1h';
type CandleDirection = 'LONG' | 'SHORT' | 'NEUTRAL';

// CARGA DINÁMICA CON PROTECCIÓN
const TradingChart = dynamic(() => import('@/components/trading-chart').then(mod => mod.TradingChart), { ssr: false });
const OperationsConsole = dynamic(() => import('@/components/operations-console').then(mod => mod.OperationsConsole), { ssr: false });
const NikimaruChat = dynamic(() => import('@/components/nikimaru-chat').then(mod => mod.NikimaruChat), { ssr: false });

export default function NikimaruApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');
  const [advice, setAdvice] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // 1. EFECTO DE MONTAJE: Evita la pantalla blanca por hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. LÓGICA DE IA (DENTRO DEL COMPONENTE)
  const fetchAI = useCallback(async () => {
    if (!isHuellaActive || currentPrice === 0) return;
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: currentPrice, huella: isHuellaActive, tf: activeTimeframe, direction: candleDirection }),
      });
      const data = await res.json();
      setAdvice(data.text);
    } catch (e) {
      console.error("Error AI:", e);
    } finally {
      setIsLoadingAI(false);
    }
  }, [isHuellaActive, currentPrice, activeTimeframe, candleDirection]);

  useEffect(() => {
    if (isHuellaActive) fetchAI();
  }, [isHuellaActive, fetchAI]);

  // Si no está montado, mostramos un fondo negro puro (evita el flash blanco)
  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="min-h-screen h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-gold fill-gold/20" />
          <h1 className="text-lg font-bold tracking-tighter">NIKIMARU</h1>
        </div>
        <div className="flex gap-2 bg-zinc-800 p-1 rounded-lg">
          {(['1h', '15m', '1m'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold rounded ${activeTimeframe === tf ? 'bg-gold text-black' : 'text-zinc-400'}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        <div className="flex-[3] flex flex-col gap-2">
          <div className="flex-1 relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
            <TradingChart
              timeframe={activeTimeframe}
              isActive={true}
              onPriceUpdate={setCurrentPrice}
              onHuellaChange={setIsHuellaActive}
              onDirectionChange={setCandleDirection}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              candleDirection={candleDirection}
              position={null}
            />
          </div>
          <div className="h-60 border border-zinc-800 rounded-xl bg-zinc-900/30">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={isHuellaActive}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              onStartHunt={() => { }}
              onClosePosition={() => { }}
              position={null}
            />
          </div>
        </div>

        {/* CHAT AI */}
        <div className="w-80 flex flex-col border border-zinc-800 rounded-xl bg-zinc-900/20">
          <NikimaruChat
            currentPrice={currentPrice}
            isHuellaActive={isHuellaActive}
            timeframe={activeTimeframe}
            advice={advice}
            isLoading={isLoadingAI}
          />
        </div>
      </div>
    </div>
  );
}