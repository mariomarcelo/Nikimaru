'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, DollarSign, Wallet, Target, Tag, Mic, TrendingUp } from 'lucide-react';

export default function NikimaruTerminalCompleta() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // CONTROLES DE TRADING
  const [entryPrice, setEntryPrice] = useState('68250.0');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // ESTADOS DEL CHATBOT Y UI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // MOTOR DE PRECIO SIMULADO
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 12;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1.5 : b - i * 1.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3)
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // CÁLCULO DE ROE% Y PNL
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

  // LOGICA DE MOVIMIENTO CHATBOT (DRAG & CLICK)
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

  // CONFIGURACIÓN DE TRADINGVIEW (BOTÓN FX Y COMUNIDAD ACTIVADOS)
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "1",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "toolbar_bg": "#161a1e",
        "enable_publishing": false,
        "withdateranges": true,
        "hide_side_toolbar": false,   // HERRAMIENTAS DE DIBUJO
        "hide_top_toolbar": false,    // AQUÍ ESTÁ EL BOTÓN FX / INDICADORES
        "allow_symbol_change": true,
        "save_image": true,
        "container_id": "tv_chart",
        "show_popup_button": true,
        "support_host": "https://www.tradingview.com"
      });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase tracking-tighter"><Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span></div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all shadow-md">
            <Maximize2 size={12} /> MODO ANÁLISIS
          </button>
        </div>
      )}

      {isFullScreen && (
        <button onClick={() => setIsFullScreen(false)} className="fixed top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl font-black text-[10px] backdrop-blur-md flex items-center gap-2 hover:bg-[#f0b90b] hover:text-black transition-all">
          <Minimize2 size={14} /> VOLVER A TERMINAL
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* LIBRO DE ORDENES (CLICK-TO-PRICE) */}
        {!isFullScreen && (
          <div className="w-[170px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="p-2 border-b border-[#2b2f36] text-[8px] font-black text-zinc-500 text-center uppercase tracking-widest">Order Book</div>
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setEntryPrice(a.p)} className="flex justify-between px-2 py-[1px] text-[#f84960] hover:bg-red-500/10 cursor-pointer"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-xs font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic cursor-pointer" onClick={() => setEntryPrice(livePrice.toFixed(1))}>${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setEntryPrice(b.p)} className="flex justify-between px-2 py-[1px] text-[#02c076] hover:bg-green-500/10 cursor-pointer"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        {/* ÁREA CENTRAL: CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-48 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              <div className="flex items-center gap-2 text-[8px] font-black text-[#f0b90b] uppercase mb-2 px-1 tracking-widest"><TrendingUp size={10} /> Posiciones Activas</div>
              {positions.map(p => {
                const s = getStats(p);
                return (
                  <div key={p.id} className={`flex flex-col bg-black/40 p-3 rounded-xl mb-2 border-l-4 ${s.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'}`}>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x | {p.amount.toFixed(1)} USDT</span>
                        <span className="text-[9px] text-zinc-500 font-mono italic">In: {p.entry.toFixed(1)}</span>
                      </div>
                      <div className="text-right flex flex-col">
                        <span className={`text-[12px] font-black ${s.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{s.roe}%</span>
                        <span className="text-[9px] text-zinc-400 font-mono">${s.pnl} USDT</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(pct => (
                        <button key={pct} onClick={() => closePosition(p.id, pct)} className="flex-1 bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[8px] py-1.5 rounded font-black transition-all">
                          {pct === 100 ? 'Cerrar' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: CONTROLES DE ORDEN */}
        {!isFullScreen && (
          <div className="w-[250px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 z-40 overflow-y-auto">
            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700">
              <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2"><Tag size={10} /> Precio Orden</span>
              <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-[#f0b90b] outline-none" />
            </div>

            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700">
              <span className="text-[8px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2"><DollarSign size={10} /> Monto USDT</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-2"><span>Apalancamiento</span><span className="text-[#f0b90b] font-mono">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b]" />
            </div>

            <div className={`p-3 rounded-xl border transition-all ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-2"><span className="text-[8px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={10} /> Orden Gatillo</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="w-4 h-4 accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="0.00" className="w-full bg-transparent text-right text-xs font-mono text-[#f0b90b] outline-none" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all text-white border-b-4 border-[#01a666]">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all text-white border-b-4 border-[#d13a4d]">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU BOT (DRAGGABLE + CHAT COMPLETO) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[999] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-80 h-[400px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-6 pointer-events-auto animate-in slide-in-from-bottom-8">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[11px] uppercase">
                <span className="flex items-center gap-2"><Bot size={16} /> Nikimaru Terminal</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto text-[11px] bg-[#0b0e11]/80 space-y-4">
                <div className="bg-[#2b3139] p-3 rounded-2xl rounded-tl-none text-zinc-100 border border-zinc-700 italic leading-relaxed">
                  "Sistemas listos jefe. Botón fx activo para buscar indicadores de la comunidad. He habilitado el micrófono y el envío de comandos."
                </div>
              </div>
              <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-[#0b0e11] flex-1 rounded-2xl px-4 text-[11px] text-white py-3 outline-none border border-zinc-800 focus:border-[#f0b90b]/40"
                    placeholder="Comandos IA..."
                  />
                  <button className="bg-[#f0b90b] p-3 rounded-2xl text-black hover:scale-105 active:scale-95 transition-all shadow-lg"><Send size={18} /></button>
                </div>
                <button className="w-full bg-[#2b3139] py-2.5 rounded-xl flex items-center justify-center gap-2 text-[#f0b90b] text-[9px] font-bold border border-zinc-700 hover:bg-[#363c45] transition-all">
                  <Mic size={14} /> COMANDO POR VOZ ACTIVADO
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
    </div>
  );
}