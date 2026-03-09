'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, Gauge, DollarSign, Wallet, TrendingUp } from 'lucide-react';

export default function NikimaruMasterTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // TRADING STATES
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [chatInput, setChatInput] = useState('');

  // BOT STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // ORDER BOOK
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 15;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1 : b - i * 1).toFixed(1),
        q: (Math.random() * 2).toFixed(3)
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
    setPositions([{ id: Date.now(), type, entry: livePrice, leverage, amount: parseFloat(amount) }, ...positions]);
  };

  // BOT LOGIC (CLICK & DRAG REPARADO)
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e: React.MouseEvent) => {
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist < 5) setIsChatOpen(!isChatOpen);
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setBotPos({ x: window.innerWidth - e.clientX - 30, y: window.innerHeight - e.clientY - 30 });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isDragging]);

  // CHART
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

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase"><Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span></div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={12} /> MODO ANÁLISIS
          </button>
        </div>
      )}

      {/* BOTÓN SALIR FULLSCREEN */}
      {isFullScreen && (
        <button onClick={() => setIsFullScreen(false)} className="fixed top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl flex items-center gap-2 font-black text-[10px] backdrop-blur-md">
          <Minimize2 size={14} /> VOLVER AL PANEL
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* LIBRO DE ÓRDENES */}
        {!isFullScreen && (
          <div className="w-[160px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} className="flex justify-between px-2 py-[0.5px] text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-xs font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} className="flex justify-between px-2 py-[0.5px] text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        {/* CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              {positions.map(p => {
                const s = getPNL(p);
                return (
                  <div key={p.id} className={`flex items-center justify-between bg-black/30 p-3 rounded-xl mb-1 border-l-4 ${s.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'}`}>
                    <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</span><span className="text-[9px] text-zinc-500">${p.amount} USDT</span></div>
                    <div className="text-right"><span className={`text-xs font-black ${s.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{s.roe}% (${s.pnl})</span></div>
                    <button onClick={() => setPositions(prev => prev.filter(pos => pos.id !== p.id))} className="bg-[#2b3139] text-[8px] px-2 py-1 rounded font-black ml-2">CERRAR</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTROLES DERECHA */}
        {!isFullScreen && (
          <div className="w-[240px] border-l border-[#2b2f36] bg-[#161a1e] p-3 flex flex-col gap-3 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-2 rounded-xl border border-zinc-700">
              <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-1"><DollarSign size={10} /> Monto USDT</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>
            <div className="bg-black/20 p-2 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-1"><span>Apalancamiento</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 accent-[#f0b90b]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Sell / Short</button>
            </div>
          </div>
        )}

        {/* CHATBOT REPARADO */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[999] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-72 h-80 bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in slide-in-from-bottom-4">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[10px] uppercase">
                <span className="flex items-center gap-2"><Bot size={14} /> Nikimaru AI</span>
                <button onClick={() => setIsChatOpen(false)}><X size={14} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3">
                <div className="bg-[#2b3139] p-2 rounded-2xl rounded-tl-none text-white leading-tight italic">"¡Todo listo jefe! He estabilizado el sistema. Puedes escribirme aquí o moverme por la pantalla."</div>
              </div>
              <div className="p-3 bg-[#1e2329] border-t border-[#2b2f36] flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[10px] text-white py-2 outline-none border border-transparent focus:border-[#f0b90b]/50"
                  placeholder="Escribir mensaje..."
                />
                <button className="bg-[#f0b90b] p-2 rounded-xl text-black hover:scale-110 transition-all"><Send size={14} /></button>
              </div>
            </div>
          )}
          <div
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all"
          >
            <Bot size={28} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}