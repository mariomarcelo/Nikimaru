'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp, Gauge, DollarSign } from 'lucide-react';

export default function NikimaruTerminalCompleta() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // MOTOR DE PRECIO
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 15;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 10 }, (_, i) => ({
        p: (t === 'ask' ? b + (10 - i) * 1 : b - i * 1).toFixed(1),
        q: (Math.random() * 2).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // PNL CALCULATOR
  const getPNL = (p: any) => {
    const isLong = p.type === 'LONG';
    const priceDiff = isLong ? (livePrice - p.entry) : (p.entry - livePrice);
    const roe = (priceDiff / p.entry) * p.leverage * 100;
    const pnlUsdt = (p.amount * roe) / 100;
    return { roe: roe.toFixed(2), pnl: pnlUsdt.toFixed(2), isProfit: roe >= 0 };
  };

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    if (isNaN(entry) || isNaN(parseFloat(amount))) return;
    setPositions([{ id: Date.now(), type, entry, leverage, amount: parseFloat(amount), tp: tpPrice, sl: slPrice }, ...positions]);
  };

  const closePartial = (id: number, pct: number) => {
    if (pct === 100) setPositions(prev => prev.filter(p => p.id !== id));
    else setPositions(prev => prev.map(p => p.id === id ? { ...p, amount: p.amount * (1 - pct / 100) } : p));
  };

  // BOT DRAG LOGIC
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setBotPos({ x: window.innerWidth - e.clientX - 30, y: window.innerHeight - e.clientY - 30 });
    };
    const onMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
        if (dist < 5) setIsChatOpen(!isChatOpen);
        setIsDragging(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [isDragging, isChatOpen]);

  // CHART SETUP
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({ "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart" });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER: SOLO VISIBLE SI NO ES FULL SCREEN */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50 shadow-md">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase tracking-tighter">
            <Zap size={18} fill="#f0b90b" />
            <span>Nikimaru <span className="text-white font-thin tracking-widest">OS</span></span>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all"
          >
            <Maximize2 size={14} /> MODO ANÁLISIS
          </button>
        </div>
      )}

      {/* BOTÓN PARA SALIR DE FULL SCREEN: SOLO VISIBLE EN FULL SCREEN */}
      {isFullScreen && (
        <button
          onClick={() => setIsFullScreen(false)}
          className="fixed top-6 right-6 z-[999] bg-[#161a1e]/90 text-[#f0b90b] p-4 rounded-2xl border border-[#f0b90b]/40 shadow-2xl hover:bg-[#f0b90b] hover:text-black transition-all flex items-center gap-2 font-black text-xs backdrop-blur-md"
        >
          <Minimize2 size={20} /> SALIR DEL MODO ANÁLISIS
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* PANEL IZQUIERDO (ORDER BOOK) */}
        {!isFullScreen && (
          <div className="w-[180px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-red-500/10 text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-md font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-green-500/10 text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        {/* CENTRO: CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />

          {!isFullScreen && (
            <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] p-3 overflow-y-auto">
              <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase mb-2">
                <span>Posiciones Activas</span>
                <span>PNL / ROE%</span>
              </div>
              {positions.map(p => {
                const stats = getPNL(p);
                return (
                  <div key={p.id} className={`flex items-center justify-between bg-black/40 p-3 rounded-xl mb-2 border-l-4 ${stats.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'}`}>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x | ${p.amount} USDT</span>
                      <span className="text-[9px] text-zinc-500 font-mono">Entrada: {p.entry.toFixed(1)}</span>
                    </div>
                    <div className="text-right flex flex-col items-end mr-4">
                      <span className={`text-[12px] font-black ${stats.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{stats.isProfit ? '+' : ''}{stats.pnl} USDT</span>
                      <span className={`text-[10px] font-bold ${stats.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{stats.isProfit ? '+' : ''}{stats.roe}%</span>
                    </div>
                    <div className="flex gap-1">
                      {[25, 50, 100].map(pct => (
                        <button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-zinc-700 text-[9px] px-2 py-1.5 rounded font-black transition-colors">
                          {pct === 100 ? 'CLOSE' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: CONTROL */}
        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-3 rounded-2xl border border-zinc-700">
              <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1 mb-1"><DollarSign size={12} /> Tamaño Orden</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-2xl font-mono text-white outline-none" />
            </div>
            <div className="bg-black/20 p-3 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Gauge size={12} /> Apalancamiento</span><span className="text-[#f0b90b] font-black bg-[#f0b90b]/10 px-2 rounded">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b]" />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU BOT (DRAG & CLICK) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[999] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-64 h-72 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[10px] uppercase"><span>Nikimaru AI</span><button onClick={() => setIsChatOpen(false)}><X size={14} /></button></div>
              <div className="flex-1 p-4 text-[10px] text-[#f0b90b]">¡Botón de escape añadido! Ahora podés entrar y salir del modo análisis sin problemas jefe.</div>
            </div>
          )}
          <div onMouseDown={onMouseDown} className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <Bot size={28} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}