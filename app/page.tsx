'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, Maximize2, Minimize2, TrendingUp, TrendingDown } from 'lucide-react';

export default function NikimaruAnalysisTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // LIBRO DE ÓRDENES
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 2;
      const newPrice = livePrice + variation;
      setLivePrice(newPrice);

      const newAsks = Array.from({ length: 20 }, (_, i) => ({
        p: (newPrice + (20 - i) * 0.5).toFixed(1),
        q: (Math.random() * 3).toFixed(3),
        v: Math.random() * 100
      }));
      const newBids = Array.from({ length: 20 }, (_, i) => ({
        p: (newPrice - i * 0.5).toFixed(1),
        q: (Math.random() * 3).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: newAsks, bids: newBids });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    setPositions([{ id: Date.now(), type, entry: parseFloat(selectedPrice), leverage: 20, amount: 1000 }, ...positions]);
  };

  const calculatePNL = (pos: any) => {
    const diff = pos.type === 'LONG' ? (livePrice - pos.entry) : (pos.entry - livePrice);
    const pnl = (diff / pos.entry) * pos.amount * pos.leverage;
    const percentage = (diff / pos.entry) * 100 * pos.leverage;
    return { pnl: pnl.toFixed(2), percent: percentage.toFixed(2), isProfit: pnl >= 0 };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const onMouseMove = (mE: MouseEvent) => {
      setBotPos({ x: window.innerWidth - mE.clientX - 30, y: window.innerHeight - mE.clientY - 30 });
    };
    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_analisis"
    });
    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }
  }, [isFullScreen]); // Se recarga al cambiar de modo para ajustar el tamaño

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-30 shadow-2xl">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase italic">
            <Zap size={20} fill="#f0b90b" />
            <span>Nikimaru Terminal</span>
          </div>
          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 bg-[#2b3139] px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-[#3b4149] transition-all"
          >
            <Maximize2 size={14} /> MODO ANÁLISIS
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* BOTÓN PARA SALIR DE FULL SCREEN (Sólo visible en Full Screen) */}
        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            className="fixed top-4 left-4 z-[150] bg-black/60 hover:bg-[#f0b90b] text-[#f0b90b] hover:text-black p-2 rounded-full border border-[#f0b90b]/40 backdrop-blur-md transition-all shadow-2xl group"
          >
            <Minimize2 size={24} />
            <span className="absolute left-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded ml-2">SALIR</span>
          </button>
        )}

        {/* IZQUIERDA: LIBRO DE ÓRDENES (Se oculta en Full Screen) */}
        {!isFullScreen && (
          <div className="w-[220px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono z-20 text-[10px]">
            <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px] font-bold"><span>Precio</span><span>Tamaño</span></div>
            <div className="flex-1 overflow-hidden flex flex-col justify-end text-[#f84960]">
              {orderBook.asks.map((a, i) => (
                <div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-white/5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${a.v}%` }} />
                  <span className="z-10">{a.p}</span><span className="text-zinc-400 z-10">{a.q}</span>
                </div>
              ))}
            </div>
            <div className="p-3 text-lg font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center animate-pulse">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden text-[#02c076]">
              {orderBook.bids.map((b, i) => (
                <div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-white/5 relative">
                  <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${b.v}%` }} />
                  <span className="z-10">{b.p}</span><span className="text-zinc-400 z-10">{b.q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CENTRO: CHART (OCUPA TODO EN MODO ANÁLISIS) */}
        <div className={`flex-1 flex flex-col bg-black relative z-0`}>
          <div id="tv_chart_analisis" ref={container} className="flex-1 w-full h-full" />

          {/* TABLA POSICIONES (Se oculta en Full Screen) */}
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-zinc-800">
                  {positions.map(p => {
                    const data = calculatePNL(p);
                    return (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className={`p-2 font-bold ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</td>
                        <td className="p-2 font-mono text-zinc-400">In: ${p.entry}</td>
                        <td className={`p-2 font-black ${data.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{data.pnl} ({data.percent}%)</td>
                        <td className="p-2 text-right"><button onClick={() => setPositions(positions.filter(x => x.id !== p.id))}><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DERECHA: PANEL DE ÓRDENES (Se oculta en Full Screen) */}
        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-5 flex flex-col gap-4 z-20">
            <div className="bg-[#2b3139] p-4 rounded-2xl border border-zinc-700">
              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Precio Orden</label>
              <input className="w-full bg-transparent text-right text-2xl font-mono text-[#f0b90b] outline-none" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} />
            </div>
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs active:scale-95 transition-all">Buy / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs active:scale-95 transition-all">Sell / Short</button>
          </div>
        )}

        {/* NIKIMARU BOT (SIEMPRE PRESENTE) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[200] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in zoom-in">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2"><Bot size={20} /> NIKIMARU AI</div>
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs space-y-3">
                <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-3 rounded-2xl text-[#f0b90b]">
                  {isFullScreen ? "Modo Análisis activado. Tenés toda la pantalla para vos. Yo me quedo acá por si necesitás algo." : "Sistemas listos. Podés cambiar a Modo Análisis arriba a la derecha."}
                </div>
              </div>
              <div className="p-4 bg-[#1e2329] border-t border-zinc-800 flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[11px] outline-none text-white py-2" placeholder="Preguntar a Nikimaru..." />
                <button onClick={() => setChatInput('')} className="bg-[#f0b90b] text-black p-2 rounded-xl active:scale-90 transition-all"><Send size={16} fill="black" /></button>
              </div>
            </div>
          )}
          <div onMouseDown={handleMouseDown} className="pointer-events-auto p-1 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing">
            {!isChatOpen && <span className="bg-black/90 text-[#f0b90b] text-[9px] font-black px-3 py-1 rounded-full border border-[#f0b90b]/30 shadow-2xl backdrop-blur-md">NIKIMARU</span>}
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-5 rounded-full shadow-2xl transition-all ${isChatOpen ? 'bg-zinc-800' : 'bg-[#f0b90b]'}`}>
              <Bot size={32} className={isChatOpen ? 'text-white' : 'text-black'} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}