'use client';

import dynamic from 'next/dynamic';

// Cargamos el gráfico sin SSR para evitar errores de servidor
const TradingChart = dynamic(() => import('@/components/trading-chart').then(mod => mod.TradingChart), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-yellow-500">CONECTANDO CON TRADINGVIEW...</div>
});

export default function Page() {
  return (
    <main className="h-screen w-screen bg-black p-4">
      <div className="flex flex-col h-full gap-4">
        {/* Header simple */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h1 className="text-xl font-bold text-white tracking-tighter">
            NIKIMARU <span className="text-yellow-500 underline decoration-yellow-500/30">CHART_CORE</span>
          </h1>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Binance Data Feed Active
          </div>
        </div>

        {/* Contenedor del Gráfico */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-500/5">
          <TradingChart />
        </div>
      </div>
    </main>
  );
}