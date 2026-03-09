'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NikimaruBubble } from '@/components/nikimaru-bubble';

const TradingChart = dynamic(() => import('@/components/trading-chart').then(mod => mod.TradingChart), { ssr: false });
const OperationsConsole = dynamic(() => import('@/components/operations-console').then(mod => mod.OperationsConsole), { ssr: false });

export default function NikimaruApp() {
  const [mounted, setMounted] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden uppercase font-mono">
      {/* BURBUJA FLOTANTE (Independiente) */}
      <NikimaruBubble />

      <main className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* GRÁFICO (TRADINGVIEW) - Máximo espacio */}
        <section className="flex-[4] rounded-xl border border-zinc-800 overflow-hidden">
          <TradingChart
            onPriceUpdate={setCurrentPrice}
            onHuellaChange={setIsHuellaActive}
            timeframe="1m"
            isActive={true}
            position={null}
          />
        </section>

        {/* CONSOLA - Lateral derecho fijo */}
        <section className="w-80 rounded-xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-md">
          <OperationsConsole
            currentPrice={currentPrice}
            isHuellaActive={isHuellaActive}
            isRayoDorado={isHuellaActive}
            onStartHunt={() => { }}
            onClosePosition={() => { }}
            position={null}
          />
        </section>
      </main>
    </div>
  );
}
