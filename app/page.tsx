'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, TrendingDown, Shield } from 'lucide-react';

export default function NikimaruTerminal() {
  const [leverage, setLeverage] = useState(10);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Evitamos que se duplique el gráfico si ya existe
    if (container.current && !container.current.querySelector('script')) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "1",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "hide_top_toolbar": false,
        "save_image": false,
        "backgroundColor": "rgba(0, 0, 0, 1)",
        "gridColor": "rgba(255, 255, 255, 0.06)",
        "container_id": "tradingview_chart"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
            <Activity className="text-black w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic">Nikimaru <span className="text-yellow-500">Terminal</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">

        {/* PANEL IZQUIERDO */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 tracking-[0.2em]">Leverage Control</h3>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50, 75, 100, 125].map((lvl) => (
                <button key={lvl} onClick={() => setLeverage(lvl)}
                  className={`py-2 rounded-lg font-mono text-xs border transition-all ${leverage === lvl ? 'bg-yellow-500 border-yellow-500 text-black font-bold' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                    }`}>{lvl}x</button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex-1 space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-4 tracking-[0.2em]">Execution</h3>
            <button className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl flex items-center justify-between group transition-all font-black text-sm uppercase">
              Market Long <TrendingUp className="w-5 h-5" />
            </button>
            <button className="w-full bg-red-600 hover:bg-red-500 text-white p-4 rounded-xl flex items-center justify-between group transition-all font-black text-sm uppercase">
              Market Short <TrendingDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: EL GRÁFICO REAL */}
        <div className="col-span-9 bg-zinc-900/20 border border-zinc-800 rounded-3xl overflow-hidden relative">
          <div
            id="tradingview_chart"
            ref={container}
            className="w-full h-full"
          />
        </div>

      </div>
    </div>
  );
}