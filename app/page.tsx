'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Bot, Maximize2, Minimize2, Gauge, DollarSign, Wallet } from 'lucide-react';

export default function NikimaruFinalBuild() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
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
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1 : b - i * 1).toFixed(1),
        q: (Math.random() * 2).toFixed(3)
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = livePrice;
    setPositions([{ id: Date.now(), type, entry, leverage, amount: parseFloat(amount) }, ...positions]);
  };

  // BOT LOGIC: REPARADO CLICK VS DRAG
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const onBotClick = (e: React.MouseEvent) => {
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist < 5) {
      setIsChatOpen(!isChatOpen);
    }
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

      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase"><Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span></div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={12} /> FULL SCREEN
          </button>
        </div>
      )}

      {isFullScreen && (
        <button onClick={() => setIsFullScreen(false)} className="fixed top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl flex items-center gap-2 font-black text-[10px] backdrop-blur-md hover:bg-[#f0b90b] hover:text-black">
          <Minimize2 size={14} /> VOLVER AL PANEL
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
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

        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto font-sans">
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col"><span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</span><span className="text-[9px] text-zinc-500">${p.amount} USDT</span></div>
                  <button onClick={() => setPositions([])} className="bg-[#2b3139] text-[8px] px-2 py-1 rounded font-black hover:bg-red-500 transition-colors">CERRAR</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isFullScreen && (
          <div className="w-[240px] border-l border-[#2b2f36] bg-[#161a1e] p-3 flex flex-col gap-2 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-2 rounded-xl border border-zinc-700">
              <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase mb-1"><span>Costo (USDT)</span><Wallet size={10} /></div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>

            <div className="bg-black/20 p-2 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-1"><span>Apalancamiento</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 accent-[#f0b90b] cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] hover:bg-[#02d887] py-3 rounded-lg font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] hover:bg-[#ff5d73] py-3 rounded-lg font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU BOT MINIMALISTA (SIN BARRA DE CHAT) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[999] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-48 bg-[#161a1e]/95 border border-[#f0b90b]/40 rounded-2xl shadow-2xl p-4 mb-4 pointer-events-auto backdrop-blur-md animate-in zoom-in-90 duration-150">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#02c076] animate-pulse"></div>
                <span className="text-[9px] font-black uppercase text-[#f0b90b]">Nikimaru AI</span>
              </div>
              <p className="text-[10px] leading-tight text-white font-medium italic">
                "El BTC está mostrando fuerza. He ajustado los controles para que operes con precisión quirúrgica, jefe."
              </p>
              <button onClick={() => setIsChatOpen(false)} className="mt-3 w-full py-1 text-[8px] font-bold bg-[#2b3139] rounded-lg text-zinc-400 hover:text-white transition-colors">CERRAR NOTA</button>
            </div>
          )}
          <div
            onMouseDown={onMouseDown}
            onMouseUp={onBotClick}
            className="pointer-events-auto p-3 bg-[#f0b90b] rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform flex items-center justify-center"
          >
            <Bot size={24} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}