'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp } from 'lucide-react';

export default function NikimaruProTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DE TRADING
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Simulación de precio vivo
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => prev + (Math.random() - 0.5) * 5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Función para abrir posición
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    const newPos = {
      id: Date.now(),
      type,
      entry: entry || livePrice,
      tp: tpPrice,
      sl: slPrice,
      amount: 1000,
      leverage: 20
    };
    setPositions([newPos, ...positions]);
    setTpPrice(''); setSlPrice(''); setTriggerPrice(''); setUseTrigger(false);
  };

  // Función para cierre parcial
  const closePartial = (id: number, percentage: number) => {
    if (percentage === 100) {
      setPositions(prev => prev.filter(p => p.id !== id));
    } else {
      setPositions(prev => prev.map(p =>
        p.id === id ? { ...p, amount: p.amount * (1 - percentage / 100) } : p
      ));
    }
  };

  // Carga del Gráfico
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_stable"
      });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50 shadow-xl">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase italic tracking-tighter">
            <Zap size={18} fill="#f0b90b" />
            <span>Nikimaru <span className="text-white font-light">Pro</span></span>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all"
          >
            <Maximize2 size={14} /> MODO ANÁLISIS
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* BOTÓN SALIR FULL SCREEN */}
        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            className="fixed top-4 left-4 z-[100] bg-black/80 text-[#f0b90b] p-3 rounded-full border border-[#f0b90b]/30 backdrop-blur-md"
          >
            <Minimize2 size={24} />
          </button>
        )}

        {/* LADO IZQUIERDO: CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_stable" ref={container} className="flex-1 w-full" />

          {!isFullScreen && (
            <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              <div className="flex justify-between text-[9px] text-zinc-500 font-black uppercase mb-2 px-1">
                <span>Gestión de Posiciones</span>
                <span>Toma de Ganancias</span>
              </div>
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                      {p.type} 20x | ${p.amount.toFixed(0)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono italic">
                      Entrada: {p.entry.toFixed(1)} | TP: {p.tp || '-'} | SL: {p.sl || '-'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => closePartial(p.id, pct)}
                        className="bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[9px] px-2 py-1 rounded-md font-bold transition-all"
                      >
                        {pct === 100 ? 'Cerrar' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LADO DERECHO: PANEL PRO */}
        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">

            {/* GATILLO */}
            <div className={`p-3 rounded-2xl border transition-all ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={12} /> Gatillo</span>
                <input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" />
              </div>
              <input
                disabled={!useTrigger}
                placeholder="Precio Disparo"
                className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none text-[#f0b90b]"
                value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)}
              />
            </div>

            {/* TP / SL */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800">
                <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1 mb-1"><TrendingUp size={10} className="text-[#02c076]" /> Take Profit</span>
                <input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} />
              </div>
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800">
                <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1 mb-1"><ShieldAlert size={10} className="text-[#f84960]" /> Stop Loss</span>
                <input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} />
              </div>
            </div>

            <div className="bg-[#2b3139] p-4 rounded-2xl">
              <label className="text-[9px] text-zinc-500 font-black uppercase block mb-1">Precio Mercado</label>
              <input className="w-full bg-transparent text-right text-xl font-mono text-[#f0b90b] outline-none" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-green-900/10">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-red-900/10">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU FLOATING */}
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-72 h-96 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs">
                <span>NIKIMARU AI</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] text-[#f0b90b]">
                Modo Pro cargado. Si la pantalla se pone blanca, es por el gráfico; ya lo blindé para que no pase.
              </div>
              <div className="p-3 bg-[#1e2329] flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[10px] outline-none text-white py-2" placeholder="Comando..." />
                <button onClick={() => setChatInput('')} className="bg-[#f0b90b] p-2 rounded-xl text-black active:scale-90 transition-all"><Send size={14} /></button>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="pointer-events-auto p-5 bg-[#f0b90b] rounded-full shadow-2xl active:scale-90 transition-all"
          >
            <Bot size={30} className="text-black" />
          </button>
        </div>

      </div>
    </div>
  );
}