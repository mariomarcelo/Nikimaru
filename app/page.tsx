'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, DollarSign, Target, Tag, Mic, TrendingUp } from 'lucide-react';

export default function NikimaruUltimateTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // TRADING CONTROLS
  const [entryPrice, setEntryPrice] = useState('68250.0');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // BOT & UI STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // 1. MOTOR DE PRECIO Y ORDER BOOK
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 12;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1.5 : b - i * 1.5).toFixed(1),
        q: (Math.random() * 2.5).toFixed(3)
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const getStats = (p: any) => {
    const isLong = p.type === 'LONG';
    const diff = isLong ? (livePrice - p.entry) : (p.entry - livePrice);
    const roe = (diff / p.entry) * p.leverage * 100;
    const pnlUsdt = (p.amount * roe) / 100;
    return { roe: roe.toFixed(2), pnl: pnlUsdt.toFixed(2), isProfit: roe >= 0 };
  };

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(entryPrice);
    if (isNaN(entry) || isNaN(parseFloat(amount))) return;
    setPositions([{ id: Date.now(), type, entry, leverage, amount: parseFloat(amount) }, ...positions]);
  };

  const closePosition = (id: number, percent: number) => {
    if (percent === 100) {
      setPositions(prev => prev.filter(p => p.id !== id));
    } else {
      setPositions(prev => prev.map(p =>
        p.id === id ? { ...p, amount: p.amount * (1 - percent / 100) } : p
      ));
    }
  };

  // 2. LÓGICA DE MOVIMIENTO DEL BOT
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist < 6) setIsChatOpen(!isChatOpen);
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

  // 3. TRADINGVIEW INTEGRATION (REPARADO CON KEY DINÁMICO)
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "1",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "hide_top_toolbar": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "save_image": true,
        "container_id": "tv_chart",
        "timezone": "Etc/UTC",
        "withdateranges": true
      });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="h-screen w-screen bg-[#0b0e11] text-[#eaecef] font-sans grid grid-rows-[auto_1fr] overflow-hidden select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <header className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50 shrink-0">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic tracking-tighter uppercase">
            <Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={12} /> MODO ANÁLISIS
          </button>
        </header>
      )}

      {/* CUERPO PRINCIPAL (GRID ESTANCO) */}
      <div className={`grid ${isFullScreen ? 'grid-cols-1' : 'grid-cols-[170px_1fr_250px]'} flex-1 overflow-hidden transition-all duration-300`}>

        {/* CAJA 1: ORDER BOOK */}
        {!isFullScreen && (
          <aside className="border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] overflow-hidden">
            <div className="p-2 border-b border-[#2b2f36] text-[8px] font-black text-zinc-500 text-center uppercase">Order Book</div>
            <div className="flex-1 flex flex-col justify-end overflow-hidden">
              {orderBook.asks.map((a, i) => (
                <div key={i} onClick={() => setEntryPrice(a.p)} className="flex justify-between px-2 py-[1px] text-[#f84960] hover:bg-red-500/10 cursor-pointer">
                  <span>{a.p}</span><span>{a.q}</span>
                </div>
              ))}
            </div>
            <div className="p-2 text-xs font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic cursor-pointer animate-pulse" onClick={() => setEntryPrice(livePrice.toFixed(1))}>
              ${livePrice.toFixed(1)}
            </div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (
                <div key={i} onClick={() => setEntryPrice(b.p)} className="flex justify-between px-2 py-[1px] text-[#02c076] hover:bg-green-500/10 cursor-pointer">
                  <span>{b.p}</span><span>{b.q}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* CAJA 2: CHART + POSICIONES (CENTRO DINÁMICO) */}
        <main className="flex flex-col bg-black relative overflow-hidden min-w-0">
          {isFullScreen && (
            <button onClick={() => setIsFullScreen(false)} className="absolute top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl font-black text-[10px] backdrop-blur-md flex items-center gap-2 hover:bg-[#f0b90b] hover:text-black transition-all">
              <Minimize2 size={14} /> VOLVER A TERMINAL
            </button>
          )}

          {/* El KEY aquí es vital para que TradingView se redibuje al cambiar el tamaño del grid */}
          <div
            key={isFullScreen ? 'full' : 'split'}
            id="tv_chart"
            ref={container}
            className="flex-1 w-full h-full"
          />

          {!isFullScreen && (
            <section className="h-48 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto shrink-0">
              <div className="flex items-center gap-2 text-[8px] font-black text-[#f0b90b] uppercase mb-2 px-1 tracking-widest"><TrendingUp size={10} /> Posiciones Activas</div>
              {positions.map(p => {
                const s = getStats(p);
                return (
                  <div key={p.id} className={`flex flex-col bg-black/40 p-3 rounded-xl mb-2 border-l-4 ${s.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                          {p.type} {p.leverage}x | {p.amount.toFixed(1)} USDT
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono italic">Entry: {p.entry.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[12px] font-black block ${s.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{s.roe}%</span>
                        <span className="text-[9px] text-zinc-400 font-mono italic">${s.pnl} USDT</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(pct => (
                        <button key={pct} onClick={() => closePosition(p.id, pct)} className="flex-1 bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[8px] py-1.5 rounded font-black transition-all uppercase">
                          {pct === 100 ? 'Cerrar' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>

        {/* CAJA 3: PANEL DE CONTROL */}
        {!isFullScreen && (
          <aside className="border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 overflow-y-auto shadow-2xl overflow-x-hidden">
            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700 shrink-0">
              <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2"><Tag size={10} /> Precio Orden</span>
              <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-[#f0b90b] outline-none" />
            </div>

            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700 shrink-0">
              <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2"><DollarSign size={10} /> Monto a Invertir</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800 shrink-0">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-2"><span>Apalancamiento</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b] cursor-pointer" />
            </div>

            <div className={`p-3 rounded-xl border transition-all shrink-0 ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5 ring-1 ring-[#f0b90b]/30' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={10} /> Gatillo</span>
                <input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="w-4 h-4 accent-[#f0b90b]" />
              </div>
              <input disabled={!useTrigger} placeholder="Precio Gatillo" className="w-full bg-transparent text-right text-xs font-mono text-[#f0b90b] outline-none placeholder-zinc-700" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] hover:bg-[#02d887] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#01a666] active:scale-95 transition-all">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] hover:bg-[#ff5d73] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#d13a4d] active:scale-95 transition-all">Sell / Short</button>
            </div>
          </aside>
        )}
      </div>

      {/* CAPA FLOTANTE: NIKIMARU BOT (LAYER 1000) */}
      <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[1000] flex flex-col items-end pointer-events-none">
        {isChatOpen && (
          <div className="w-80 h-[400px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-[32px] shadow-2xl flex flex-col overflow-hidden mb-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[11px] uppercase shrink-0">
              <span className="flex items-center gap-2"><Bot size={16} /> Nikimaru Terminal</span>
              <button onClick={() => setIsChatOpen(false)} className="bg-black/10 p-1 rounded-full"><X size={16} /></button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto text-[11px] bg-[#0b0e11]/80 space-y-4">
              <div className="bg-[#2b3139] p-3 rounded-2xl rounded-tl-none text-zinc-100 border border-zinc-700 leading-relaxed italic">
                "Cajas blindadas activadas, jefe. Gráfico configurado para auto-ajustarse en pantalla completa."
              </div>
            </div>
            <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex flex-col gap-3 shrink-0">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-[#0b0e11] flex-1 rounded-2xl px-4 text-[11px] text-white py-3 outline-none border border-zinc-800 focus:border-[#f0b90b]/40"
                  placeholder="Comandos de IA..."
                />
                <button className="bg-[#f0b90b] p-3 rounded-2xl text-black hover:scale-105 active:scale-95 transition-all"><Send size={18} /></button>
              </div>
              <button className="w-full bg-[#2b3139] py-2.5 rounded-xl flex items-center justify-center gap-2 text-[#f0b90b] text-[9px] font-bold hover:bg-[#363c45] border border-zinc-700">
                <Mic size={14} /> ESCUCHANDO...
              </button>
            </div>
          </div>
        )}
        <div
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-[0_0_30px_rgba(240,185,11,0.4)] cursor-grab active:cursor-grabbing hover:scale-110 transition-all flex items-center justify-center border-2 border-black/10"
        >
          <Bot size={32} className="text-black" />
        </div>
      </div>
    </div>
  );
}