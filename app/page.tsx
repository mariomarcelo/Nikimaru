'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ChevronDown } from 'lucide-react';

export default function BinanceFullTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);

  // Simulación de Order Book
  const [asks, setAsks] = useState<{ p: string, q: string }[]>([]);
  const [bids, setBids] = useState<{ p: string, q: string }[]>([]);

  useEffect(() => {
    // Cargar Gráfico
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "timezone": "Etc/UTC",
      "theme": "dark", "style": "1", "locale": "en", "enable_publishing": false,
      "hide_top_toolbar": false, "container_id": "tv_chart"
    });
    if (container.current) container.current.appendChild(script);

    // Simular datos del Order Book
    const interval = setInterval(() => {
      const basePrice = 68245;
      const newAsks = Array.from({ length: 12 }, (_, i) => ({
        p: (basePrice + (12 - i) * 0.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3)
      }));
      const newBids = Array.from({ length: 12 }, (_, i) => ({
        p: (basePrice - i * 0.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3)
      }));
      setAsks(newAsks);
      setBids(newBids);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] gap-6">
        <div className="flex items-center gap-2 text-[#f0b90b]">
          <Zap className="w-5 h-5 fill-[#f0b90b]" />
          <span className="font-bold">NIKIMARU</span>
        </div>
        <div className="text-xs flex gap-4">
          <span className="font-bold">BTCUSDT</span>
          <span className="text-[#02c076]">$68,245.10</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* COLUMNA IZQUIERDA: ORDER BOOK */}
        <div className="w-[250px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[10px] font-mono">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase">
            <span>Price(USDT)</span>
            <span>Size(BTC)</span>
          </div>

          {/* ASKS (VENTAS) */}
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between px-2 py-[1px] hover:bg-red-500/10 relative">
                <span className="text-[#f84960]">{a.p}</span>
                <span className="z-10">{a.q}</span>
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${parseFloat(a.q) * 20}%` }} />
              </div>
            ))}
          </div>

          {/* PRECIO ACTUAL */}
          <div className="p-2 text-lg font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center">
            68,245.10 <span className="text-xs text-zinc-500">↑</span>
          </div>

          {/* BIDS (COMPRAS) */}
          <div className="flex-1 overflow-hidden">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between px-2 py-[1px] hover:bg-green-500/10 relative">
                <span className="text-[#02c076]">{b.p}</span>
                <span className="z-10">{b.q}</span>
                <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${parseFloat(b.q) * 20}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* CENTRO: GRÁFICO */}
        <div className="flex-1 bg-black overflow-hidden">
          <div id="tv_chart" ref={container} className="w-full h-full" />
        </div>

        {/* DERECHA: PANEL DE ÓRDENES */}
        <div className="w-[300px] border-l border-[#2b2f36] bg-[#161a1e] flex flex-col">
          <div className="p-3 grid grid-cols-2 gap-2">
            <button className="bg-[#2b2f36] py-1 rounded text-xs">Cross</button>
            <button className="bg-[#2b2f36] py-1 rounded text-xs text-[#f0b90b] border border-[#f0b90b]/40">{leverage}x</button>
          </div>

          <div className="p-3 space-y-4">
            <div className="flex gap-4 border-b border-[#2b2f36] pb-2 text-xs">
              <span className="text-[#f0b90b] border-b border-[#f0b90b]">Limit</span>
              <span className="text-zinc-500">Market</span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-2 top-2 text-[10px] text-zinc-500">Price</span>
                <input type="text" className="w-full bg-[#2b3139] rounded p-2 pt-5 text-right text-sm outline-none" defaultValue="68245.1" />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-2 text-[10px] text-zinc-500">Size</span>
                <input type="text" className="w-full bg-[#2b3139] rounded p-2 pt-5 text-right text-sm outline-none" placeholder="0.000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="bg-[#02c076] py-2.5 rounded font-bold text-sm">Buy/Long</button>
              <button className="bg-[#f84960] py-2.5 rounded font-bold text-sm">Sell/Short</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}