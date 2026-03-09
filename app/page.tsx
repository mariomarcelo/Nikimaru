'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, Maximize2, Minimize2, Target, ShieldAlert, PieChart } from 'lucide-react';

export default function NikimaruProTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // NUEVOS ESTADOS DE TRADING
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => prev + (Math.random() - 0.5) * 2);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      type,
      entry: parseFloat(useTrigger ? triggerPrice : selectedPrice),
      tp: tpPrice,
      sl: slPrice,
      amount: 1000,
      leverage: 20
    };
    setPositions([newPos, ...positions]);
    // Limpiar campos
    setTpPrice(''); setSlPrice(''); setTriggerPrice(''); setUseTrigger(false);
  };

  const closePartial = (id: number, percentage: number) => {
    if (percentage === 100) {
      setPositions(positions.filter(p => p.id !== id));
    } else {
      setPositions(positions.map(p =>
        p.id === id ? { ...p, amount: p.amount * (1 - percentage / 100) } : p
      ));
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_pro"
    });
    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-30">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase italic"><Zap size={20} fill="#f0b90b" /><span>Nikimaru Pro</span></div>
          <button onClick={() => setIsFullScreen(true)} className="bg-[#2b3139] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">MODO ANÁLISIS</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isFullScreen && (
          <button onClick={() => setIsFullScreen(false)} className="fixed top-4 left-4 z-[150] bg-black/60 text-[#f0b90b] p-2 rounded-full border border-[#f0b90b]/40 backdrop-blur-md"><Minimize2 size={24} /></button>
        )}

        {/* IZQUIERDA: CHART */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_pro" ref={container} className="flex-1 w-full" />

          {/* TABLA POSICIONES AVANZADA */}
          {!isFullScreen && (
            <div className="h-48 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto p-2">
              <div className="flex justify-between mb-2 px-2 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                <span>Posiciones Activas</span>
                <span>Salidas Parciales</span>
              </div>
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/30 p-2 rounded-lg mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[11px] font-bold ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Size: ${p.amount.toFixed(0)} | TP: {p.tp || '--'} | SL: {p.sl || '--'}</span>
                  </div>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-white/10 text-[9px] px-2 py-1 rounded transition-colors uppercase font-bold">
                        {pct === 100 ? 'Close' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA: PANEL DE ÓRDENES GATILLO/SL/TP */}
        {!isFullScreen && (
          <div className="w-[300px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-20 overflow-y-auto">

            {/* GATILLO */}
            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1"><Target size={12} /> Gatillo</span>
                <input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" />
              </div>
              <input disabled={!useTrigger} className={`w-full bg-[#2b3139] p-2 rounded text-right text-xs font-mono outline-none ${!useTrigger ? 'opacity-30' : 'text-[#f0b90b]'}`} placeholder="Precio Disparo" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1 mb-1"><TrendingUp size={10} className="text-[#02c076]" /> Take Profit</span>
                <input className="w-full bg-[#2b3139] p-2 rounded text-right text-xs font-mono outline-none" placeholder="Precio TP" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} />
              </div>
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800">
                <span className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1 mb-1"><ShieldAlert size={10} className="text-[#f84960]" /> Stop Loss</span>
                <input className="w-full bg-[#2b3139] p-2 rounded text-right text-xs font-mono outline-none" placeholder="Precio SL" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} />
              </div>
            </div>

            <div className="bg-[#2b3139] p-3 rounded-xl mt-2">
              <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Precio Mercado</label>
              <input className="w-full bg-transparent text-right text-xl font-mono text-[#f0b90b] outline-none" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-green-900/10">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-red-900/10">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU (SIEMPRE VISIBLE) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs uppercase"><div className="flex items-center gap-2"><Bot size={20} /> Nikimaru Trader</div><button onClick={() => setIsChatOpen(false)}><X size={18} /></button></div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3">
                <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-3 rounded-2xl text-[#f0b90b]">
                  Panel de riesgo activo. Ya podés programar tu SL/TP y cerrar parciales con los botones rápidos.
                </div>
              </div>
              <div className="p-4 bg-[#1e2329] flex gap-2"><input className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[11px] outline-none text-white py-2" placeholder="Órdenes por voz..." /><button className="bg-[#f0b90b] text-black p-2 rounded-xl"><Send size={16} fill="black" /></button></div>
            </div>
          )}
          <div onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} className="pointer-events-auto flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing">
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-5 rounded-full shadow-2xl transition-all ${isChatOpen ? 'bg-zinc-800' : 'bg-[#f0b90b]'}`}><Bot size={32} className={isChatOpen ? 'text-white' : 'text-black'} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}