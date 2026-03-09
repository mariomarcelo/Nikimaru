'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, TrendingUp, TrendingDown } from 'lucide-react';

export default function NikimaruUltimateTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);
  const [leverage, setLeverage] = useState(20);

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // LIBRO DE ÓRDENES
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // 1. MOTOR DE PRECIO EN VIVO Y LIBRO
  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 2;
      const newPrice = livePrice + variation;
      setLivePrice(newPrice);

      // Actualizar libro de órdenes basado en el precio vivo
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

  // 2. FUNCIÓN PARA ABRIR ÓRDENES
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      type,
      entry: parseFloat(selectedPrice),
      leverage: leverage,
      amount: 1000 // Monto simulado de 1000 USDT
    };
    setPositions([newPos, ...positions]);
  };

  // 3. CÁLCULO DE GANANCIAS EN TIEMPO REAL
  const calculatePNL = (pos: any) => {
    const diff = pos.type === 'LONG'
      ? (livePrice - pos.entry)
      : (pos.entry - livePrice);

    const pnl = (diff / pos.entry) * pos.amount * pos.leverage;
    const percentage = (diff / pos.entry) * 100 * pos.leverage;

    return {
      pnl: pnl.toFixed(2),
      percent: percentage.toFixed(2),
      isProfit: pnl >= 0
    };
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
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_final"
    });
    if (container.current && container.current.children.length === 0) container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative selection:bg-[#f0b90b]/40">

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-30 shadow-2xl">
        <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase italic">
          <Zap size={20} fill="#f0b90b" />
          <span>Nikimaru Terminal</span>
        </div>
        <div className="text-[11px] font-mono flex gap-4">
          <span className="text-zinc-500 font-bold uppercase">BTCUSDT Mark: <span className="text-white">${livePrice.toFixed(2)}</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* IZQUIERDA: LIBRO DE ÓRDENES */}
        <div className="w-[220px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono z-20 text-[10px]">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px] font-bold">
            <span>Precio</span>
            <span>Tamaño</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {orderBook.asks.map((a, i) => (
              <div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-white/5 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${a.v}%` }} />
                <span className="text-[#f84960] z-10">{a.p}</span>
                <span className="text-zinc-400 z-10">{a.q}</span>
              </div>
            ))}
          </div>
          <div className="p-3 text-lg font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic animate-pulse">
            ${livePrice.toFixed(1)}
          </div>
          <div className="flex-1 overflow-hidden">
            {orderBook.bids.map((b, i) => (
              <div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-white/5 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${b.v}%` }} />
                <span className="text-[#02c076] z-10">{b.p}</span>
                <span className="text-zinc-400 z-10">{b.q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTRO: CHART + POSICIONES CON CÁLCULO */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_final" ref={container} className="flex-1 w-full" />

          <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <div className="p-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-800">Panel de Posiciones</div>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="p-2">Posición</th>
                  <th className="p-2">Precio Entrada</th>
                  <th className="p-2">Precio Marca</th>
                  <th className="p-2">PNL (USDT)</th>
                  <th className="p-2">ROE %</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map(p => {
                  const data = calculatePNL(p);
                  return (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-white/5">
                      <td className={`p-2 font-bold ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                        {p.type} {p.leverage}x
                      </td>
                      <td className="p-2 font-mono text-zinc-400">${p.entry.toFixed(2)}</td>
                      <td className="p-2 font-mono">${livePrice.toFixed(2)}</td>
                      <td className={`p-2 font-black ${data.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                        {data.isProfit ? '+' : ''}{data.pnl}
                      </td>
                      <td className={`p-2 font-bold ${data.isProfit ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                        <span className="flex items-center gap-1">
                          {data.isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {data.percent}%
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <button onClick={() => setPositions(positions.filter(x => x.id !== p.id))} className="text-zinc-600 hover:text-white"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL DE ÓRDENES */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-5 flex flex-col gap-4 z-20 shadow-2xl">
          <div className="bg-[#2b3139] p-4 rounded-2xl border border-zinc-700">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-2">Precio Orden</label>
            <input
              className="w-full bg-transparent text-right text-2xl font-mono text-[#f0b90b] outline-none"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => handleTrade('LONG')} className="w-full bg-[#02c076] hover:bg-[#03d382] py-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Comprar / Long</button>
            <button onClick={() => handleTrade('SHORT')} className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-4 rounded-xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Vender / Short</button>
          </div>
        </div>

        {/* NIKIMARU BOT (ARRASTRABLE) */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[100] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in zoom-in">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs">
                <div className="flex items-center gap-2"><Bot size={20} /> NIKIMARU AI</div>
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-xs space-y-3">
                <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-3 rounded-2xl text-[#f0b90b]">
                  Calculando ganancias jefe. El PNL y el ROE están activos.
                </div>
              </div>
              <div className="p-4 bg-[#1e2329] border-t border-zinc-800 flex gap-2">
                <input
                  value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  className="bg-[#0b0e11] flex-1 rounded-xl px-3 text-[11px] outline-none text-white py-2"
                  placeholder="Hablar con Nikimaru..."
                />
                <button onClick={() => setChatInput('')} className="bg-[#f0b90b] text-black p-2 rounded-xl active:scale-90 transition-all">
                  <Send size={16} fill="black" />
                </button>
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