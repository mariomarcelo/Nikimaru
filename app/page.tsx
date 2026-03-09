'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp, Gauge, DollarSign } from 'lucide-react';

export default function NikimaruUltimateTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // TRADING STATES
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // BOT STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // ORDER BOOK SIMULATION
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 8;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 0.5 : b - i * 0.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // TRADING ACTIONS
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    if (isNaN(entry) || isNaN(parseFloat(amount))) return;
    setPositions([{
      id: Date.now(),
      type,
      entry,
      leverage,
      amount: parseFloat(amount),
      tp: tpPrice,
      sl: slPrice
    }, ...positions]);
  };

  const closePartial = (id: number, pct: number) => {
    if (pct === 100) setPositions(prev => prev.filter(p => p.id !== id));
    else setPositions(prev => prev.map(p => p.id === id ? { ...p, amount: p.amount * (1 - pct / 100) } : p));
  };

  // BOT MOVEMENT LOGIC (FIXED)
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
        if (dist < 5) setIsChatOpen(!isChatOpen); // Si se movió poco, es un click
        setIsDragging(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [isDragging, isChatOpen]);

  // CHART LOGIC
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
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50 shadow-md">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase"><Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span></div>
          <button onClick={() => setIsFullScreen(true)} className="bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">MODO ANÁLISIS</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {!isFullScreen && (
          <div className="w-[180px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-red-500/10 text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-md font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-green-500/10 text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              <div className="text-[9px] font-bold text-zinc-500 uppercase mb-2">Posiciones</div>
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/30 p-2 rounded-xl mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x | ${p.amount} USDT</span><span className="text-[9px] text-zinc-500">In: {p.entry}</span></div>
                  <div className="flex gap-1">{[25, 50, 75, 100].map(pct => (<button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-[#f0b90b] text-[9px] px-2 py-1 rounded font-bold">{pct === 100 ? 'X' : `${pct}%`}</button>))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-3 rounded-2xl border border-zinc-700">
              <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1 mb-1"><DollarSign size={12} /> Monto Orden</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-2xl font-mono text-white outline-none" />
            </div>
            <div className="bg-black/20 p-3 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Gauge size={12} /> Apalancamiento</span><span className="text-[#f0b90b] font-bold">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b]" />
            </div>
            <div className={`p-3 rounded-2xl border ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={12} /> Trigger</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="Precio Disparo" className="w-full bg-[#2b3139] p-2 rounded text-right text-xs text-[#f0b90b]" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800"><span className="text-[8px] font-bold text-[#02c076] uppercase block">TP</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-1.5 rounded text-right text-xs" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} /></div>
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800"><span className="text-[8px] font-bold text-[#f84960] uppercase block">SL</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-1.5 rounded text-right text-xs" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} /></div>
            </div>
            <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-3 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-3 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95">Sell / Short</button>
          </div>
        )}

        {/* NIKIMARU BOT (FIXED DRAG & CLICK) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-64 h-72 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[10px] uppercase"><span>Nikimaru AI</span><button onClick={() => setIsChatOpen(false)}><X size={14} /></button></div>
              <div className="flex-1 p-4 text-[10px] text-[#f0b90b]">¡Listo jefe! Arreglé el botón. Ahora podés moverme o hacerme click para hablar.</div>
              <div className="p-3 bg-[#1e2329] flex gap-2"><input className="bg-[#0b0e11] flex-1 rounded-xl px-2 text-[9px] text-white py-1 outline-none" placeholder="Escribir..." /><button className="bg-[#f0b90b] p-1.5 rounded-xl text-black"><Send size={12} /></button></div>
            </div>
          )}
          <div onMouseDown={onMouseDown} className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
            <Bot size={28} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}