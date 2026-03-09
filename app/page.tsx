'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, TrendingUp, TrendingDown, Trash2, X } from 'lucide-react';

export default function BinanceProTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [asks, setAsks] = useState<{ p: string, q: string }[]>([]);
  const [bids, setBids] = useState<{ p: string, q: string }[]>([]);

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      symbol: 'BTCUSDT',
      type: type,
      leverage: leverage,
      entry: '68250.40',
      pnl: (Math.random() * 10 - 2).toFixed(2),
    };
    setPositions([newPos, ...positions]);
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
    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }

    const interval = setInterval(() => {
      const basePrice = 68250;
      setAsks(Array.from({ length: 12 }, (_, i) => ({ p: (basePrice + (12 - i) * 0.5).toFixed(1), q: (Math.random() * 1.5).toFixed(3) })));
      setBids(Array.from({ length: 12 }, (_, i) => ({ p: (basePrice - i * 0.5).toFixed(1), q: (Math.random() * 1.5).toFixed(3) })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* MODAL DE APALANCAMIENTO (GATILLO) */}
      {showLeverageModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e2329] w-full max-w-sm rounded-xl border border-[#2b3139] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Ajustar Apalancamiento</h3>
              <button onClick={() => setShowLeverageModal(false)}><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-[#2b3139] p-4 rounded-lg text-center">
                <span className="text-4xl font-black text-[#f0b90b]">{leverage}x</span>
              </div>

              <input
                type="range" min="1" max="125" value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
              />

              <div className="grid grid-cols-4 gap-2 text-[10px] text-zinc-500 font-mono text-center">
                <span>1x</span><span>25x</span><span>50x</span><span>125x</span>
              </div>

              <button
                onClick={() => setShowLeverageModal(false)}
                className="w-full bg-[#f0b90b] text-black font-bold py-3 rounded-lg hover:bg-[#d9a508]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="p-2 text-md font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center italic tracking-tighter underline">68,250.40</div>
          <div className="flex-1 overflow-hidden">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between px-2 text-[#02c076]"><span>{b.p}</span><span className="text-zinc-400">{b.q}</span></div>
            ))}
          </div>
        </div>

        {/* CENTRO: GRÁFICO + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="flex-1 relative">
            <div id="tv_chart_final" ref={container} className="w-full h-full" />
          </div>

          <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <div className="p-2 border-b border-[#2b2f36] text-[10px] font-bold text-zinc-500 uppercase">Posiciones ({positions.length})</div>
            <table className="w-full text-[10px] text-left">
              <thead className="text-zinc-500 border-b border-[#2b2f36]">
                <tr>
                  <th className="p-2">Símbolo</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Apal.</th>
                  <th className="p-2">PNL</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-[#2b2f36] hover:bg-zinc-800/30 font-mono">
                    <td className="p-2">{pos.symbol}</td>
                    <td className={pos.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}>{pos.type}</td>
                    <td className="p-2">{pos.leverage}x</td>
                    <td className={parseFloat(pos.pnl) >= 0 ? 'text-[#02c076]' : 'text-[#f84960]'}>{pos.pnl} USDT</td>
                    <td className="p-2"><button onClick={() => setPositions(positions.filter(p => p.id !== pos.id))}><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL OPERATIVO */}
        <div className="w-[260px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            {/* BOTÓN DE APALANCAMIENTO DINÁMICO */}
            <button
              onClick={() => setShowLeverageModal(true)}
              className="flex-1 bg-[#2b3139] py-2 rounded text-xs text-[#f0b90b] border border-[#f0b90b]/20 hover:border-[#f0b90b] transition-all font-bold"
            >
              Cross {leverage}x
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-[#2b3139] p-2 rounded flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Price</span>
              <input type="text" className="bg-transparent text-right text-sm outline-none font-mono" defaultValue="68250.40" />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] hover:bg-[#03d382] py-3 rounded font-black text-xs uppercase shadow-lg shadow-green-900/10">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-3 rounded font-black text-xs uppercase shadow-lg shadow-red-900/10">Sell / Short</button>
          </div>

          <div className="mt-auto border-t border-[#2b2f36] pt-4 text-[10px] text-zinc-500 font-mono space-y-1">
            <div className="flex justify-between"><span>Max Open</span><span>5.20 BTC</span></div>
            <div className="flex justify-between text-white font-bold"><span>Available</span><span>1,240.50 USDT</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}