'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';

export default function NikimaruMasterTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DE TRADING (Gatillo, SL, TP)
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // LIBRO DE ÓRDENES
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // ESTADOS DEL ROBOT (Móvil)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

  // 1. MOTOR DE PRECIO Y ORDER BOOK
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 10;
      setLivePrice(p);

      const generateRows = (base: number, type: 'ask' | 'bid') =>
        Array.from({ length: 15 }, (_, i) => ({
          p: (type === 'ask' ? base + (15 - i) * 0.5 : base - i * 0.5).toFixed(1),
          q: (Math.random() * 2).toFixed(3),
          v: Math.random() * 100
        }));

      setOrderBook({ asks: generateRows(p, 'ask'), bids: generateRows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // 2. FUNCIÓN DE COMPRA / VENTA (CORREGIDA)
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    if (isNaN(entry)) return;

    const newPos = {
      id: Date.now(),
      type,
      entry: entry,
      tp: tpPrice,
      sl: slPrice,
      amount: 1000,
      leverage: 20
    };
    setPositions([newPos, ...positions]);
    // Reset inputs
    setTpPrice(''); setSlPrice(''); setTriggerPrice(''); setUseTrigger(false);
  };

  // 3. CIERRE PARCIAL
  const closePartial = (id: number, pct: number) => {
    if (pct === 100) {
      setPositions(prev => prev.filter(p => p.id !== id));
    } else {
      setPositions(prev => prev.map(p =>
        p.id === id ? { ...p, amount: p.amount * (1 - pct / 100) } : p
      ));
    }
  };

  // 4. MOVIMIENTO DEL BOT
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setBotPos({
      x: window.innerWidth - e.clientX - 25,
      y: window.innerHeight - e.clientY - 25
    });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

  // 5. CARGA DEL GRÁFICO
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_master"
      });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* HEADER DINÁMICO */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase tracking-tighter">
            <Zap size={18} fill="#f0b90b" />
            <span>Nikimaru <span className="text-white font-thin">Master</span></span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={14} /> FULL SCREEN
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* BOTÓN SALIR FULL SCREEN */}
        {isFullScreen && (
          <button onClick={() => setIsFullScreen(false)} className="fixed top-4 left-4 z-[100] bg-black/80 text-[#f0b90b] p-3 rounded-full border border-[#f0b90b]/30 backdrop-blur-md">
            <Minimize2 size={24} />
          </button>
        )}

        {/* IZQUIERDA: ORDER BOOK (Se oculta en Full Screen) */}
        {!isFullScreen && (
          <div className="w-[220px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[10px] z-20">
            <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px] font-bold"><span>Precio</span><span>Tamaño</span></div>
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (
                <div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-red-500/10 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-red-500/5" style={{ width: `${a.v}%` }} />
                  <span className="text-[#f84960] z-10">{a.p}</span><span className="text-zinc-400 z-10">{a.q}</span>
                </div>
              ))}
            </div>
            <div className="p-3 text-lg font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (
                <div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-green-500/10 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-green-500/5" style={{ width: `${b.v}%` }} />
                  <span className="text-[#02c076] z-10">{b.p}</span><span className="text-zinc-400 z-10">{b.q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CENTRO: CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_master" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} 20x | ${p.amount.toFixed(0)}</span><span className="text-[9px] text-zinc-500">Entrada: {p.entry} | TP: {p.tp || '-'} | SL: {p.sl || '-'}</span></div>
                  <div className="flex gap-1">{[25, 50, 75, 100].map(pct => (<button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[9px] px-2 py-1 rounded font-bold transition-all">{pct === 100 ? 'Close' : `${pct}%`}</button>))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA: PANEL PRO (Se oculta en Full Screen) */}
        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">
            <div className={`p-3 rounded-2xl border transition-all ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={12} /> Gatillo</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="Precio Disparo" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none text-[#f0b90b]" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800"><span className="text-[8px] font-bold text-[#02c076] uppercase block mb-1">Take Profit</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} /></div>
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800"><span className="text-[8px] font-bold text-[#f84960] uppercase block mb-1">Stop Loss</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} /></div>
            </div>
            <div className="bg-[#2b3139] p-4 rounded-2xl"><label className="text-[9px] text-zinc-500 font-black uppercase block mb-1">Precio Mercado</label><input className="w-full bg-transparent text-right text-xl font-mono text-[#f0b90b] outline-none" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} /></div>
            <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-green-900/10">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-red-900/10">Sell / Short</button>
          </div>
        )}

        {/* NIKIMARU BOT (CORREGIDO: MOVIMIENTO Y CHAT) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-72 h-80 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs uppercase"><span>Nikimaru AI</span><button onClick={() => setIsChatOpen(false)}><X size={16} /></button></div>
              <div className="flex-1 p-4 overflow-y-auto text-[10px] text-[#f0b90b]">Sistemas restablecidos jefe. Todo en su lugar.</div>
              <div className="p-3 bg-[#1e2329] flex gap-2"><input className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[10px] outline-none text-white py-2" placeholder="Comando..." /><button className="bg-[#f0b90b] p-2 rounded-xl text-black"><Send size={14} /></button></div>
            </div>
          )}
          <div onMouseDown={() => setIsDragging(true)} className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <Bot size={28} className="text-black" onClick={() => !isDragging && setIsChatOpen(!isChatOpen)} />
          </div>
        </div>

      </div>
    </div>
  );
}