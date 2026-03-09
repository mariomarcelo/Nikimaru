'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { Zap, Trash2, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// MEMOIZAMOS EL GRÁFICO PARA QUE NO PARPADEE NI SE RECARGUE
const TradingViewWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "allow_symbol_change": true,
      "container_id": "tv_chart_stable"
    });
    if (container.current) {
      container.current.innerHTML = '';
      container.current.appendChild(script);
    }
  }, []);

  return <div id="tv_chart_stable" ref={container} className="w-full h-full" />;
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default function BinanceUltraTerminal() {
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [currentBtcPrice, setCurrentBtcPrice] = useState(68250.0);
  const [asks, setAsks] = useState<{ p: string, q: string }[]>([]);
  const [bids, setBids] = useState<{ p: string, q: string }[]>([]);

  // Función para abrir orden
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      symbol: 'BTCUSDT',
      type: type,
      leverage: leverage,
      entry: currentBtcPrice, // Toma el precio actual exacto
      amount: 0.1,
    };
    setPositions([newPos, ...positions]);
  };

  // EFECTO DE PRECIO: No afecta al gráfico ahora
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBtcPrice(prev => prev + (Math.random() - 0.5) * 5);

      const base = 68250;
      setAsks(Array.from({ length: 10 }, (_, i) => ({ p: (currentBtcPrice + (10 - i) * 2).toFixed(1), q: (Math.random() * 1).toFixed(3) })));
      setBids(Array.from({ length: 10 }, (_, i) => ({ p: (currentBtcPrice - i * 2).toFixed(1), q: (Math.random() * 1).toFixed(3) })));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentBtcPrice]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* MODAL APALANCAMIENTO */}
      {showLeverageModal && (
        <div className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center">
          <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] w-80 shadow-2xl">
            <div className="flex justify-between mb-4 font-bold"><span>Ajustar Apalancamiento</span><button onClick={() => setShowLeverageModal(false)}><X /></button></div>
            <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full accent-[#f0b90b] mb-4" />
            <div className="text-center text-3xl font-black text-[#f0b90b] mb-6">{leverage}x</div>
            <button onClick={() => setShowLeverageModal(false)} className="w-full bg-[#f0b90b] text-black font-bold py-2 rounded">Confirmar</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="h-10 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between text-[11px]">
        <div className="flex items-center gap-4 text-[#f0b90b] font-bold uppercase tracking-widest">
          <Zap size={14} fill="#f0b90b" /> <span>Nikimaru Terminal</span>
          <div className="text-white ml-4 flex gap-4 font-mono">
            <span>BTCUSDT <span className={currentBtcPrice > 68250 ? "text-[#02c076]" : "text-[#f84960]"}>${currentBtcPrice.toFixed(2)}</span></span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LIBRO DE ÓRDENES */}
        <div className="w-[180px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[9px] font-mono">
          <div className="flex-1 overflow-hidden flex flex-col justify-end opacity-60">
            {asks.map((a, i) => (
              <div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 cursor-pointer hover:bg-white/5 text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>
            ))}
          </div>
          <div className="p-2 text-xs font-bold text-[#02c076] bg-black/20 text-center border-y border-zinc-800 font-mono">
            {currentBtcPrice.toFixed(1)}
          </div>
          <div className="flex-1 overflow-hidden opacity-60">
            {bids.map((b, i) => (
              <div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 cursor-pointer hover:bg-white/5 text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>
            ))}
          </div>
        </div>

        {/* ÁREA CENTRAL */}
        <div className="flex-1 flex flex-col relative bg-black">
          <div className="flex-1 relative">
            {/* EL GRÁFICO ESTABLE */}
            <TradingViewWidget />

            {/* LÍNEAS DE ORDEN FLOTANTES */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
              {positions.map(pos => (
                <div key={pos.id} className={`flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 text-[9px] font-bold shadow-lg ${pos.type === 'LONG' ? 'bg-[#02c076]' : 'bg-[#f84960]'}`}>
                  {pos.type === 'LONG' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                  {pos.type} ENTRADA: ${pos.entry.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DE POSICIONES */}
          <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <table className="w-full text-[10px] text-left">
              <thead className="text-zinc-500 border-b border-[#2b2f36] sticky top-0 bg-[#161a1e]">
                <tr>
                  <th className="p-2">Símbolo/Tipo</th>
                  <th className="p-2">Precio Entrada</th>
                  <th className="p-2">ROE %</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const diff = currentBtcPrice - pos.entry;
                  const pct = (diff / pos.entry) * 100;
                  const roe = (pos.type === 'LONG' ? pct : -pct) * pos.leverage;

                  return (
                    <tr key={pos.id} className="border-b border-zinc-800 font-mono hover:bg-white/5 transition-colors">
                      <td className="p-2">
                        <span className={pos.type === 'LONG' ? 'text-[#02c076] font-bold' : 'text-[#f84960] font-bold'}>
                          {pos.symbol} {pos.type} {pos.leverage}x
                        </span>
                      </td>
                      <td className="p-2 text-zinc-400">${pos.entry.toFixed(2)}</td>
                      <td className={`p-2 font-bold text-sm ${roe >= 0 ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                        {roe >= 0 ? '+' : ''}{roe.toFixed(2)}%
                      </td>
                      <td className="p-2">
                        <button onClick={() => setPositions(positions.filter(p => p.id !== pos.id))} className="text-zinc-500 hover:text-white uppercase text-[9px]">Market</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="w-[240px] border-l border-[#2b2f36] bg-[#161a1e] p-3 flex flex-col gap-4">
          <button onClick={() => setShowLeverageModal(true)} className="w-full bg-[#2b3139] py-2 rounded text-xs text-[#f0b90b] font-bold border border-[#f0b90b]/20 hover:border-[#f0b90b]">
            Cross {leverage}x
          </button>

          <div className="bg-[#2b3139] p-2 rounded flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold text-[9px]">PRECIO</span>
            <input type="text" className="bg-transparent text-right outline-none font-mono w-24" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] py-3 rounded font-black text-[11px] uppercase active:scale-95 transition-transform">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] py-3 rounded font-black text-[11px] uppercase active:scale-95 transition-transform">Sell / Short</button>
          </div>
        </div>
      </div>
    </div>
  );
}