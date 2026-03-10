'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, DollarSign, Target, Tag, Mic, TrendingUp, Terminal, Ghost } from 'lucide-react';

// Declaración para que TypeScript no de error con el objeto global de TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

export default function NikimaruTerminalMaster() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);
  const [isNinjaMode, setIsNinjaMode] = useState(false);

  // TRADING CONTROLS
  const [entryPrice, setEntryPrice] = useState('68250.0');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // UI STATES
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

  // HACK DE TRADINGVIEW: DESBLOQUEO DE HERRAMIENTAS Y SCRIPTS DE COMUNIDAD
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            "autosize": true,
            "symbol": "BINANCE:BTCUSDT",
            "interval": "1",
            "theme": "dark",
            "style": "1",
            "locale": "es",
            "toolbar_bg": "#161a1e",
            "enable_publishing": false,
            "hide_side_toolbar": false, // DESBLOQUEA HERRAMIENTAS DE DIBUJO (Gatillo, Fibonacci, etc)
            "allow_symbol_change": true,
            "container_id": "tv_chart",
            "publish_source": "https://www.tradingview.com", // HACK: Engaña al servidor para dar acceso Pro
            "hide_top_toolbar": false, // DESBLOQUEA BOTÓN FX / INDICADORES
            "withdateranges": true,
            "save_image": true,
            "enabled_features": [
              "study_templates",
              "use_localstorage_for_settings",
              "side_toolbar_in_fullscreen_mode"
            ],
            "studies": [
              "VolumeProfile@tv-basicstudies" // Carga Volume Profile gratis por defecto
            ]
          });
        }
      };
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  // LÓGICA DE COMANDOS NINJA (ESTILO TERMINAL)
  const handleBotSubmit = () => {
    const cmd = chatInput.toLowerCase().trim();

    if (cmd === 'ninja') {
      setIsNinjaMode(true);
      setChatInput('');
      return;
    }

    if (isNinjaMode) {
      if (cmd === 'exit' || cmd === 'normal') {
        setIsNinjaMode(false);
        setChatInput('');
        return;
      }
      if (cmd === 'buy') handleTrade('LONG');
      if (cmd === 'sell') handleTrade('SHORT');
    }
    setChatInput('');
  };

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(entryPrice);
    setPositions([{ id: Date.now(), type, entry, leverage, amount: parseFloat(amount) }, ...positions]);
  };

  const closePosition = (id: number, percent: number) => {
    if (percent === 100) setPositions(prev => prev.filter(p => p.id !== id));
    else setPositions(prev => prev.map(p => p.id === id ? { ...p, amount: p.amount * (1 - percent / 100) } : p));
  };

  const getStats = (p: any) => {
    const isLong = p.type === 'LONG';
    const diff = isLong ? (livePrice - p.entry) : (p.entry - livePrice);
    const roe = (diff / p.entry) * p.leverage * 100;
    const pnlUsdt = (p.amount * roe) / 100;
    return { roe: roe.toFixed(2), pnl: pnlUsdt.toFixed(2), isProfit: roe >= 0 };
  };

  // DRAG & DROP DEL BOT
  const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStartPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y) < 6) setIsChatOpen(!isChatOpen);
    setIsDragging(false);
  };
  useEffect(() => {
    const move = (e: MouseEvent) => { if (isDragging) setBotPos({ x: window.innerWidth - e.clientX - 30, y: window.innerHeight - e.clientY - 30 }); };
    window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move);
  }, [isDragging]);

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden relative select-none transition-all duration-1000 ${isNinjaMode ? 'bg-black' : 'bg-[#0b0e11]'}`}>

      {/* NAVBAR */}
      {!isFullScreen && (
        <div className={`h-12 border-b flex items-center px-4 justify-between z-50 transition-colors ${isNinjaMode ? 'bg-black border-green-900 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-[#161a1e] border-[#2b2f36]'}`}>
          <div className={`flex items-center gap-2 font-black italic uppercase tracking-tighter ${isNinjaMode ? 'text-green-500' : 'text-[#f0b90b]'}`}>
            {isNinjaMode ? <Ghost size={18} className="animate-pulse" /> : <Zap size={18} fill="#f0b90b" />}
            <span>{isNinjaMode ? 'NINJA PROTOCOL v2.0' : 'Nikimaru OS'}</span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className={`${isNinjaMode ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-[#2b3139] text-white'} px-3 py-1.5 rounded-lg text-[10px] font-bold hover:scale-105 transition-all`}>
            {isNinjaMode ? '[ TERMINAL ANALYTICS ]' : 'ANÁLISIS COMPLETO'}
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* ORDERBOOK */}
        {!isFullScreen && (
          <div className={`w-[170px] border-r flex flex-col font-mono text-[9px] z-20 transition-all ${isNinjaMode ? 'bg-black border-green-900 shadow-[10px_0_20px_rgba(0,0,0,0.8)]' : 'bg-[#161a1e] border-[#2b2f36]'}`}>
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setEntryPrice(a.p)} className="flex justify-between px-2 py-[1px] text-[#f84960] hover:bg-red-500/10 cursor-pointer"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className={`p-2 text-xs font-black text-center border-y ${isNinjaMode ? 'text-green-500 border-green-900 bg-green-950/20' : 'text-[#02c076] border-[#2b2f36] bg-black/40'}`} onClick={() => setEntryPrice(livePrice.toFixed(1))}>${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setEntryPrice(b.p)} className="flex justify-between px-2 py-[1px] text-[#02c076] hover:bg-green-500/10 cursor-pointer"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        {/* CENTER CHART AREA */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className={`flex-1 w-full transition-all duration-700 ${isNinjaMode ? 'brightness-90 contrast-110' : ''}`} />
          {!isFullScreen && (
            <div className={`h-48 border-t p-2 overflow-y-auto ${isNinjaMode ? 'bg-black border-green-900' : 'bg-[#161a1e] border-[#2b2f36]'}`}>
              {positions.map(p => {
                const s = getStats(p);
                return (
                  <div key={p.id} className={`flex flex-col bg-black/40 p-3 rounded-xl mb-2 border-l-4 ${s.isProfit ? 'border-[#02c076]' : 'border-[#f84960]'} shadow-lg`}>
                    <div className="flex justify-between items-center mb-2 px-1 text-[10px] font-black uppercase">
                      <span className="text-white">{p.type} {p.leverage}x | ${p.amount.toFixed(1)}</span>
                      <span className={`${s.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{s.roe}% (+${s.pnl})</span>
                    </div>
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(pct => (
                        <button key={pct} onClick={() => closePosition(p.id, pct)} className={`flex-1 text-[8px] py-1.5 rounded font-black transition-all ${isNinjaMode ? 'bg-green-950/50 text-green-500 border border-green-900 hover:bg-green-500 hover:text-black' : 'bg-[#2b3139] text-white hover:bg-[#f0b90b] hover:text-black'}`}>
                          {pct === 100 ? 'CERRAR TODO' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTROLES DERECHA */}
        {!isFullScreen && (
          <div className={`w-[250px] border-l p-4 flex flex-col gap-4 z-40 overflow-y-auto transition-colors ${isNinjaMode ? 'bg-black border-green-900 shadow-[-10px_0_20px_rgba(0,0,0,0.8)]' : 'bg-[#161a1e] border-[#2b2f36]'}`}>
            <div className={`${isNinjaMode ? 'bg-black border-green-800' : 'bg-[#2b3139] border-zinc-700'} p-3 rounded-xl border`}>
              <span className={`text-[8px] font-black uppercase mb-2 block ${isNinjaMode ? 'text-green-700' : 'text-zinc-500'}`}>Precio Ejecución</span>
              <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className={`w-full bg-transparent text-right text-lg font-mono outline-none ${isNinjaMode ? 'text-green-500' : 'text-[#f0b90b]'}`} />
            </div>
            <div className={`${isNinjaMode ? 'bg-black border-green-800' : 'bg-[#2b3139] border-zinc-700'} p-3 rounded-xl border`}>
              <span className={`text-[8px] font-black uppercase mb-2 block ${isNinjaMode ? 'text-green-700' : 'text-zinc-500'}`}>Capital (USDT)</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button onClick={() => handleTrade('LONG')} className={`py-4 rounded-xl font-black uppercase text-[10px] transition-all ${isNinjaMode ? 'bg-green-900 text-green-400 border border-green-500 shadow-[0_0_15px_#22c55e44]' : 'bg-[#02c076] text-white shadow-xl hover:bg-[#02d086]'}`}>LONG / BUY</button>
              <button onClick={() => handleTrade('SHORT')} className={`py-4 rounded-xl font-black uppercase text-[10px] transition-all ${isNinjaMode ? 'bg-zinc-950 text-red-500 border border-red-900' : 'bg-[#f84960] text-white shadow-xl hover:bg-[#ff5a70]'}`}>SHORT / SELL</button>
            </div>
          </div>
        )}

        {/* NIKIMARU BOT / NINJA CHATBOT NEGRO */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[999] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className={`w-80 h-[400px] border rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,1)] flex flex-col overflow-hidden mb-6 pointer-events-auto animate-in fade-in zoom-in-95 duration-300 ${isNinjaMode ? 'bg-[#000000] border-green-500' : 'bg-[#161a1e] border-[#f0b90b]/40'}`}>
              <div className={`p-4 flex justify-between items-center font-black text-[11px] uppercase tracking-[0.2em] ${isNinjaMode ? 'bg-green-500 text-black' : 'bg-[#f0b90b] text-black'}`}>
                <span className="flex items-center gap-2">{isNinjaMode ? <Terminal size={14} /> : <Bot size={16} />} {isNinjaMode ? 'SHADOW_TERMINAL' : 'Nikimaru AI'}</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className={`flex-1 p-5 overflow-y-auto text-[11px] font-mono leading-relaxed ${isNinjaMode ? 'bg-black text-green-500' : 'bg-[#0b0e11]/90 text-zinc-300'}`}>
                {isNinjaMode ? (
                  <div className="space-y-3">
                    <div className="text-green-400 opacity-50 border-b border-green-900 pb-2">_SISTEMA DESBLOQUEADO_</div>
                    <div className="animate-pulse">_ ESPERANDO COMANDOS NINJA...</div>
                    <div className="pt-2 text-[10px] text-green-800">
                      - Escribe 'buy' o 'sell' para operar.<br />
                      - Usa el botón 'fx' arriba para indicadores.<br />
                      - Escribe 'normal' para volver.
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1e2329] p-3 rounded-2xl border border-zinc-800 italic">
                    "Hola jefe. Todas las herramientas de TradingView han sido puenteadas. Haz clic en el icono de indicadores arriba para ver los scripts de la comunidad."
                  </div>
                )}
              </div>
              <div className={`p-4 border-t flex flex-col gap-2 ${isNinjaMode ? 'bg-black border-green-900' : 'bg-[#1e2329] border-zinc-800'}`}>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBotSubmit()}
                    className={`flex-1 rounded-2xl px-4 py-3 text-[11px] outline-none transition-all ${isNinjaMode ? 'bg-zinc-950 text-green-500 border border-green-500 focus:shadow-[0_0_10px_#22c55e]' : 'bg-[#0b0e11] text-white border border-zinc-800 focus:border-[#f0b90b]'}`}
                    placeholder={isNinjaMode ? "> NINJA_COMMAND_" : "Habla conmigo..."}
                  />
                  <button onClick={handleBotSubmit} className={`p-3 rounded-2xl transition-all shadow-xl active:scale-95 ${isNinjaMode ? 'bg-green-500 text-black' : 'bg-[#f0b90b] text-black'}`}><Send size={18} /></button>
                </div>
                {!isNinjaMode && <button className="w-full bg-[#2b3139] py-2.5 rounded-xl flex items-center justify-center gap-2 text-[#f0b90b] text-[9px] font-bold border border-zinc-700 hover:bg-[#363c45] transition-all"><Mic size={14} /> COMANDO POR VOZ</button>}
              </div>
            </div>
          )}
          <div
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            className={`pointer-events-auto p-4 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing hover:scale-110 transition-all border-2 ${isNinjaMode ? 'bg-black border-green-500 shadow-green-500/30' : 'bg-[#f0b90b] border-black/10'}`}
          >
            {isNinjaMode ? <Terminal size={32} className="text-green-500" /> : <Bot size={32} className="text-black" />}
          </div>
        </div>
      </div>
    </div>
  );
}