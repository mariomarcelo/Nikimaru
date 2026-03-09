'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, Target, Gauge, DollarSign, Wallet } from 'lucide-react';

export default function NikimaruCompactTerminal() {
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

  // --- ESTADOS DEL CHAT ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // MOTOR DE PRECIO
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 15;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1 : b - i * 1).toFixed(1),
        q: (Math.random() * 2).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

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

  // --- LÓGICA DE BOT (CORREGIDA) ---
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
        // Si el mouse se movió menos de 5px, es un click, no un arrastre
        if (dist < 5) setIsChatOpen(prev => !prev);
        setIsDragging(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

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
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase tracking-tighter">
            <Zap size={18} fill="#f0b90b" />
            <span>Nikimaru <span className="text-white font-thin">FUTURES</span></span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-colors">
            <Maximize2 size={12} /> ANÁLISIS
          </button>
        </div>
      )}

      {isFullScreen && (
        <button onClick={() => setIsFullScreen(false)} className="fixed top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl flex items-center gap-2 font-black text-[10px] backdrop-blur-md">
          <Minimize2 size={14} /> VOLVER
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {!isFullScreen && (
          <div className="w-[160px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[0.5px] cursor-pointer hover:bg-red-500/10 text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-xs font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[0.5px] cursor-pointer hover:bg-green-500/10 text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto font-sans">
              {positions.map(p => {
                const stats = getPNL(p);
                return (
                  <div key={p.id} className={`flex items-center justify-between bg-black/20 p-2 rounded-lg mb-1 border-l-2 ${stats.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'}`}>
                    <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</span><span className="text-[9px] text-zinc-500">${p.amount} USDT</span></div>
                    <div className="text-right flex-1 px-4"><span className={`text-[10px] font-black ${stats.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{stats.roe}%</span></div>
                    <div className="flex gap-1">
                      {[50, 100].map(pct => (
                        <button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-zinc-700 text-[8px] px-2 py-1 rounded font-black transition-colors">{pct === 100 ? 'Cerrar' : `${pct}%`}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isFullScreen && (
          <div className="w-[240px] border-l border-[#2b2f36] bg-[#161a1e] p-3 flex flex-col gap-2 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-2 rounded-xl border border-zinc-700">
              <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase mb-1"><span>Monto USDT</span><Wallet size={10} /></div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
              <div className="flex justify-between gap-1 mt-1">
                {[25, 50, 75, 100].map(p => (
                  <button key={p} className="flex-1 bg-black/20 hover:bg-[#f0b90b] hover:text-black text-[8px] py-1 rounded transition-all font-bold text-zinc-400">{p}%</button>
                ))}
              </div>
            </div>

            <div className="bg-black/20 p-2 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase mb-1"><span>Leverage</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 accent-[#f0b90b] cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800"><span className="text-[8px] font-bold text-[#02c076] uppercase block">TP</span><input placeholder="Precio" className="w-full bg-transparent text-[10px] text-right font-mono outline-none" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} /></div>
              <div className="bg-black/20 p-2 rounded-xl border border-zinc-800"><span className="text-[8px] font-bold text-[#f84960] uppercase block">SL</span><input placeholder="Precio" className="w-full bg-transparent text-[10px] text-right font-mono outline-none" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} /></div>
            </div>

            <div className={`p-2 rounded-xl border transition-all ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-1"><span className="text-[8px] font-black text-zinc-400 uppercase">Trigger</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="0.0" className="w-full bg-transparent text-[10px] text-right font-mono outline-none text-[#f0b90b]" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] hover:bg-[#02d887] py-3 rounded-lg font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all text-white">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] hover:bg-[#ff5d73] py-3 rounded-lg font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all text-white">Sell / Short</button>
            </div>
          </div>
        )}

        {/* --- NIKIMARU BOT & CHAT REPARADO --- */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[500] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-72 h-80 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in slide-in-from-bottom-4 backdrop-blur-md">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[10px] uppercase">
                <span className="flex items-center gap-2"><Bot size={14} /> Nikimaru Intelligence</span>
                <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform"><X size={14} /></button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-[#0b0e11]/60">
                <div className="bg-[#2b3139] p-3 rounded-2xl rounded-tl-none text-white leading-tight border border-white/5 italic">
                  "El mercado está volátil, jefe. He cargado el panel compacto para que tengas máxima visibilidad. ¿Ejecutamos?"
                </div>
              </div>

              <div className="p-3 bg-[#1e2329] border-t border-[#2b2f36] flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setChatInput('')}
                  className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[10px] text-white py-2 outline-none border border-zinc-800 focus:border-[#f0b90b]/40 transition-all"
                  placeholder="Escribe un comando..."
                />
                <button
                  onClick={() => setChatInput('')}
                  className="bg-[#f0b90b] p-2 rounded-xl text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}

          <div
            onMouseDown={onMouseDown}
            className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all shadow-[#f0b90b]/20 border border-white/10"
          >
            <Bot size={28} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}