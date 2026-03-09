'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

export default function BinanceProTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [positions, setPositions] = useState<any[]>([]);
  const [asks, setAsks] = useState<{ p: string, q: string }[]>([]);
  const [bids, setBids] = useState<{ p: string, q: string }[]>([]);

  // Función para ejecutar orden
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      symbol: 'BTCUSDT',
      type: type,
      leverage: leverage,
      entry: '68250.40',
      pnl: (Math.random() * 10 - 2).toFixed(2), // Simula ganancias/pérdidas
    };
    setPositions([newPos, ...positions]);
    alert(`🚀 Orden ${type} ejecutada a ${leverage}x`);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark",
      "style": "1", "locale": "en", "container_id": "tv_chart_final"
    });
    if (container.current) container.current.appendChild(script);

    const interval = setInterval(() => {
      const basePrice = 68250;
      setAsks(Array.from({ length: 12 }, (_, i) => ({ p: (basePrice + (12 - i) * 0.5).toFixed(1), q: (Math.random() * 1.5).toFixed(3) })));
      setBids(Array.from({ length: 12 }, (_, i) => ({ p: (basePrice - i * 0.5).toFixed(1), q: (Math.random() * 1.5).toFixed(3) })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between">
        <div className="flex items-center gap-2 text-[#f0b90b]">
          <Zap className="w-5 h-5 fill-[#f0b90b]" />
          <span className="font-bold uppercase tracking-tighter">Nikimaru Terminal</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* IZQUIERDA: ORDER BOOK */}
        <div className="w-[200px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[9px] font-mono">
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between px-2 text-[#f84960]"><span>{a.p}</span><span className="text-zinc-400">{a.q}</span></div>
            ))}
          </div>
          <div className="p-2 text-md font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center">68,250.40</div>
          <div className="flex-1 overflow-hidden">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between px-2 text-[#02c076]"><span>{b.p}</span><span className="text-zinc-400">{b.q}</span></div>
            ))}
          </div>
        </div>

        {/* CENTRO: GRÁFICO + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 relative">
            <div id="tv_chart_final" ref={container} className="w-full h-full" />
          </div>

          {/* PANEL DE POSICIONES ABAJO */}
          <div className="h-48 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <div className="p-2 border-b border-[#2b2f36] text-[10px] font-bold text-zinc-500 uppercase">Posiciones Abiertas ({positions.length})</div>
            <table className="w-full text-[11px] text-left">
              <thead className="text-zinc-500 border-b border-[#2b2f36]">
                <tr>
                  <th className="p-2">Símbolo</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Entrada</th>
                  <th className="p-2">PNL Unl.</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-[#2b2f36] hover:bg-zinc-800/30">
                    <td className="p-2 font-bold">{pos.symbol} <span className="text-[#f0b90b] text-[9px]">{pos.leverage}x</span></td>
                    <td className={`p-2 font-bold ${pos.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{pos.type}</td>
                    <td className="p-2 font-mono">{pos.entry}</td>
                    <td className={`p-2 font-mono ${parseFloat(pos.pnl) >= 0 ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                      {pos.pnl > 0 ? '+' : ''}{pos.pnl} USDT
                    </td>
                    <td className="p-2">
                      <button onClick={() => setPositions(positions.filter(p => p.id !== pos.id))} className="text-zinc-500 hover:text-white"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL OPERATIVO */}
        <div className="w-[260px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2b2f36] py-1 rounded text-[10px] text-[#f0b90b] border border-[#f0b90b]/30">Cross {leverage}x</button>
          </div>

          <div className="space-y-3">
            <input type="text" className="w-full bg-[#2b3139] rounded p-3 text-right text-sm outline-none" defaultValue="68250.40" />
            <input type="text" className="w-full bg-[#2b3139] rounded p-3 text-right text-sm outline-none" placeholder="Cantidad (BTC)" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] hover:bg-[#03d382] py-3 rounded font-bold text-xs uppercase">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-3 rounded font-bold text-xs uppercase">Sell / Short</button>
          </div>
        </div>
      </div>
    </div>
  );
}