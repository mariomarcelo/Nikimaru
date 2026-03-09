'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function BinanceProTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);

  // Simulación de Order Book (Datos que se mueven)
  const [asks, setAsks] = useState<{ p: string, q: string }[]>([]);
  const [bids, setBids] = useState<{ p: string, q: string }[]>([]);

  useEffect(() => {
    // 1. CARGAR VELAS REALES
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "timezone": "Etc/UTC",
      "theme": "dark", "style": "1", "locale": "en", "enable_publishing": false,
      "hide_top_toolbar": false, "container_id": "tv_chart_pro"
    });
    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }

    // 2. SIMULAR MOVIMIENTO DEL LIBRO DE ÓRDENES
    const interval = setInterval(() => {
      const basePrice = 68250;
      setAsks(Array.from({ length: 15 }, (_, i) => ({
        p: (basePrice + (15 - i) * 0.5).toFixed(1),
        q: (Math.random() * 1.5).toFixed(3)
      })));
      setBids(Array.from({ length: 15 }, (_, i) => ({
        p: (basePrice - i * 0.5).toFixed(1),
        q: (Math.random() * 1.5).toFixed(3)
      })));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden">
      {/* HEADER ESTILO BINANCE */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#f0b90b]">
            <Zap className="w-5 h-5 fill-[#f0b90b]" />
            <span className="font-bold tracking-tighter text-lg uppercase">Nikimaru <span className="text-white">Futures</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono border-l border-[#2b2f36] pl-6">
            <span className="font-bold">BTCUSDT</span>
            <span className="text-[#02c076] animate-pulse">$68,250.40</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* IZQUIERDA: ORDER BOOK (Libro de Órdenes) */}
        <div className="w-[240px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[10px] font-mono">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase">
            <span>Price(USDT)</span>
            <span>Size(BTC)</span>
          </div>

          <div className="flex-1 flex flex-col justify-end overflow-hidden">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between px-2 py-[1px] relative">
                <span className="text-[#f84960] z-10">{a.p}</span>
                <span className="z-10 text-zinc-300">{a.q}</span>
                <div className="absolute right-0 bg-[#f84960]/10 h-full transition-all duration-500" style={{ width: `${parseFloat(a.q) * 30}%` }} />
              </div>
            ))}
          </div>

          <div className="p-3 text-lg font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center">
            68,250.40 <span className="text-xs">↑</span>
          </div>

          <div className="flex-1 overflow-hidden">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between px-2 py-[1px] relative">
                <span className="text-[#02c076] z-10">{b.p}</span>
                <span className="z-10 text-zinc-300">{b.q}</span>
                <div className="absolute right-0 bg-[#02c076]/10 h-full transition-all duration-500" style={{ width: `${parseFloat(b.q) * 30}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* CENTRO: GRÁFICO DE TRADINGVIEW */}
        <div className="flex-1 bg-black overflow-hidden relative">
          <div id="tv_chart_pro" ref={container} className="w-full h-full" />
        </div>

        {/* DERECHA: PANEL DE OPERACIONES */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] flex flex-col">
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#2b2f36]">
            <button className="bg-[#2b2f36] py-1 rounded text-xs hover:bg-[#3b3f46]">Cross</button>
            <button className="bg-[#2b2f36] py-1 rounded text-xs text-[#f0b90b] border border-[#f0b90b]/40">{leverage}x</button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex gap-4 border-b border-[#2b2f36] pb-2 text-[11px] font-bold">
              <span className="text-[#f0b90b] border-b-2 border-[#f0b90b] pb-2 cursor-pointer">Limit</span>
              <span className="text-zinc-500 cursor-pointer hover:text-white transition-colors">Market</span>
            </div>

            <div className="space-y-3">
              <div className="bg-[#2b3139] rounded p-2 flex justify-between items-center border border-transparent focus-within:border-[#f0b90b]">
                <span className="text-[10px] text-zinc-500">Price</span>
                <input type="text" className="bg-transparent text-right text-sm outline-none font-mono w-24" defaultValue="68250.4" />
                <span className="text-[10px] text-zinc-400">USDT</span>
              </div>
              <div className="bg-[#2b3139] rounded p-2 flex justify-between items-center border border-transparent focus-within:border-[#f0b90b]">
                <span className="text-[10px] text-zinc-500">Size</span>
                <input type="text" className="bg-transparent text-right text-sm outline-none font-mono w-24" placeholder="0.000" />
                <span className="text-[10px] text-zinc-400">BTC</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button className="bg-[#02c076] hover:bg-[#03d382] py-3 rounded-lg font-bold text-xs uppercase shadow-lg shadow-green-900/10">Buy / Long</button>
              <button className="bg-[#f84960] hover:bg-[#ff5d72] py-3 rounded-lg font-bold text-xs uppercase shadow-lg shadow-red-900/10">Sell / Short</button>
            </div>
          </div>

          <div className="mt-auto p-4 bg-[#1e2329] border-t border-[#2b2f36] text-[10px] space-y-1 font-mono text-zinc-400">
            <div className="flex justify-between"><span>Max Buy</span><span>0.150 BTC</span></div>
            <div className="flex justify-between text-white"><span>Cost</span><span>0.00 USDT</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}