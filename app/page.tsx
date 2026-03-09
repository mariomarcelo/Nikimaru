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

  // ESTADO PARA EL PRECIO DEL INPUT
  const [selectedPrice, setSelectedPrice] = useState('68250.40');

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      symbol: 'BTCUSDT',
      type: type,
      leverage: leverage,
      entry: selectedPrice,
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

      {/* MODAL DE APALANCAMIENTO */}
      {showLeverageModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1e2329] w-full max-w-sm rounded-xl border border-[#2b3139] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 text-white font-bold text-lg">
              <h3>Ajustar Apalancamiento</h3>
              <button onClick={() => setShowLeverageModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-[#2b3139] p-4 rounded-lg text-center font-black text-[#f0b90b] text-4xl">
                {leverage}x
              </div>
              <input
                type="range" min="1" max="125" value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2b3139] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
              />
              <button onClick={() => setShowLeverageModal(false)} className="w-full bg-[#f0b90b] text-black font-bold py-3 rounded-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold uppercase tracking-tighter">
          <Zap className="w-5 h-5 fill-[#f0b90b]" />
          <span>Nikimaru Terminal</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* IZQUIERDA: ORDER BOOK CON CLIC FUNCIONAL */}
        <div className="w-[200px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[9px] font-mono">
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {asks.map((a, i) => (
              <div
                key={i}
                onClick={() => setSelectedPrice(a.p)} // CLIC PARA CARGAR PRECIO
                className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-red-500/10 transition-colors"
              >
                <span className="text-[#f84960]">{a.p}</span>
                <span className="text-zinc-400">{a.q}</span>
              </div>
            ))}
          </div>

          <div className="p-2 text-md font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center italic tracking-tighter">
            68,250.40
          </div>

          <div className="flex-1 overflow-hidden">
            {bids.map((b, i) => (
              <div
                key={i}
                onClick={() => setSelectedPrice(b.p)} // CLIC PARA CARGAR PRECIO
                className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-green-500/10 transition-colors"
              >
                <span className="text-[#02c076]">{b.p}</span>
                <span className="text-zinc-400">{b.q}</span>
              </div>
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
                  <th className="p-2">PNL</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-[#2b2f36] font-mono">
                    <td className="p-2">{pos.symbol} {pos.leverage}x</td>
                    <td className={pos.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960] font-bold'}>{pos.type}</td>
                    <td className={parseFloat(pos.pnl) >= 0 ? 'text-[#02c076]' : 'text-[#f84960]'}>{pos.pnl} USDT</td>
                    <td className="p-2"><button onClick={() => setPositions(positions.filter(p => p.id !== pos.id))}><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL OPERATIVO ACTUALIZADO */}
        <div className="w-[260px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4">
          <button
            onClick={() => setShowLeverageModal(true)}
            className="w-full bg-[#2b3139] py-2 rounded text-xs text-[#f0b90b] border border-[#f0b90b]/20 hover:border-[#f0b90b] font-bold"
          >
            Cross {leverage}x
          </button>

          <div className="space-y-3">
            <div className="bg-[#2b3139] p-2 rounded flex justify-between items-center border border-transparent focus-within:border-[#f0b90b]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Price</span>
              {/* ESTE INPUT AHORA RESPONDE AL ORDER BOOK */}
              <input
                type="text"
                className="bg-transparent text-right text-sm outline-none font-mono text-white"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] py-3 rounded font-black text-xs uppercase">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] py-3 rounded font-black text-xs uppercase">Sell / Short</button>
          </div>
        </div>
      </div>
    </div>
  );
}