'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp, TrendingDown, Gauge } from 'lucide-react';

export default function NikimaruFinalTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADO DE APALANCAMIENTO
  const [leverage, setLeverage] = useState(20);

  // ESTADOS DE TRADING (Gatillo, SL, TP)
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // LIBRO DE ÓRDENES
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

  // 1. MOTOR DE PRECIO
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 8;
      setLivePrice(p);
      const genRows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 0.5 : b - i * 0.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: genRows(p, 'ask'), bids: genRows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // 2. FUNCIÓN DE TRADE CON APALANCAMIENTO
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    if (isNaN(entry)) return;
    setPositions([{
      id: Date.now(),
      type,
      entry,
      leverage,
      amount: 1000,
      tp: tpPrice,
      sl: slPrice
    }, ...positions]);
    setTpPrice(''); setSlPrice(''); setTriggerPrice(''); setUseTrigger(false);
  };

  const closePartial = (id: number, pct: number) => {
    if (pct === 100) setPositions(prev => prev.filter(p => p.id !== id));
    else setPositions(prev => prev.map(p => p.id === id ? { ...p, amount: p.amount * (1 - pct / 100) } : p));
  };

  // 3. MOVIMIENTO BOT
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setBotPos({ x: window.innerWidth - e.clientX - 25, y: window.innerHeight - e.clientY - 25 });
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', () => setIsDragging(false));
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', () => setIsDragging(false)); };
  }, [isDragging]);

  // 4. GRÁFICO
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
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase"><Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span></div>
          <button onClick={() => setIsFullScreen(true)} className="bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">FULL SCREEN</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isFullScreen && <button onClick={() => setIsFullScreen(false)} className="fixed top-4 left-4 z-[100] bg-black/80 text-[#f0b90b] p-3 rounded-full border border-[#f0b90b]/30"><Minimize2 size={24} /></button>}

        {!isFullScreen && (
          <div className="w-[200px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
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
            <div className="h-36 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-xl mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</span><span className="text-[9px] text-zinc-500 font-mono italic">Entrada: {p.entry} | Size: ${p.amount.toFixed(0)}</span></div>
                  <div className="flex gap-1">{[25, 50, 75, 100].map(pct => (<button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[9px] px-2 py-1 rounded font-bold transition-all">{pct === 100 ? 'Close' : `${pct}%`}</button>))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isFullScreen && (
          <div className="w-[260px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">
            {/* SELECTOR DE APALANCAMIENTO */}
            <div className="bg-black/20 p-3 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Gauge size={12} /> Apalancamiento</span><span className="text-[#f0b90b] text-xs font-bold">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#f0b90b]" />
              <div className="flex justify-between text-[8px] text-zinc-600 mt-1 font-bold uppercase"><span>1x</span><span>125x</span></div>
            </div>

            <div className={`p-3 rounded-2xl border ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={12} /> Gatillo</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none text-[#f0b90b]" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800 items-center"><span className="text-[8px] font-bold text-[#02c076] uppercase block mb-1">TP</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} /></div>
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800 items-center"><span className="text-[8px] font-bold text-[#f84960] uppercase block mb-1">SL</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} /></div>
            </div>

            <div className="bg-[#2b3139] p-4 rounded-2xl"><label className="text-[9px] text-zinc-500 font-black uppercase block mb-1">Precio Mercado</label><input className="w-full bg-transparent text-right text-xl font-mono text-[#f0b90b] outline-none" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} /></div>
            <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-3 rounded-xl font-black uppercase text-xs shadow-lg">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-3 rounded-xl font-black uppercase text-xs shadow-lg">Sell / Short</button>
          </div>
        )}

        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-64 h-72 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[10px] uppercase"><span>Nikimaru AI</span><button onClick={() => setIsChatOpen(false)}><X size={14} /></button></div>
              <div className="flex-1 p-4 overflow-y-auto text-[10px] text-[#f0b90b]">Apalancamiento listo. ¿Vas a ir a 125x? Tené cuidado.</div>
              <div className="p-3 bg-[#1e2329] flex gap-2"><input className="bg-[#0b0e11] flex-1 rounded-xl px-2 text-[9px] outline-none text-white py-1" placeholder="Hablar..." /><button className="bg-[#f0b90b] p-2 rounded-xl text-black"><Send size={12} /></button></div>
            </div>
          )}
          <div onMouseDown={() => setIsDragging(true)} className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing">
            <Bot size={28} className="text-black" onClick={() => !isDragging && setIsChatOpen(!isChatOpen)} />
          </div>
        </div>
      </div>
    </div>
  );
}