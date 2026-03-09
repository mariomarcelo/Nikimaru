'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, Camera, Smartphone } from 'lucide-react';

export default function NikimaruPowerTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [positions, setPositions] = useState<any[]>([]);
  const [leverage, setLeverage] = useState(20);

  // ESTADOS DEL ROBOT Y CHAT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  // ESTADO DEL ORDER BOOK (DATOS DINÁMICOS)
  const [asks, setAsks] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);

  // Función para generar órdenes masivas
  const generateData = () => {
    const base = parseFloat(selectedPrice) || 68250;
    const newAsks = Array.from({ length: 30 }, (_, i) => ({
      p: (base + (30 - i) * 0.4).toFixed(1),
      q: (Math.random() * 2.5).toFixed(3),
      total: (Math.random() * 100)
    }));
    const newBids = Array.from({ length: 30 }, (_, i) => ({
      p: (base - (i + 1) * 0.4).toFixed(1),
      q: (Math.random() * 2.5).toFixed(3),
      total: (Math.random() * 100)
    }));
    setAsks(newAsks);
    setBids(newBids);
  };

  useEffect(() => {
    generateData();
    const timer = setInterval(generateData, 1000);
    return () => clearInterval(timer);
  }, [selectedPrice]);

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
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_main"
    });
    if (container.current && container.current.children.length === 0) container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative selection:bg-[#f0b90b]/30">

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-30 shadow-md">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold uppercase italic tracking-tighter">
          <Zap size={20} fill="#f0b90b" />
          <span className="text-lg">Nikimaru <span className="text-white font-light">OS</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* IZQUIERDA: ORDER BOOK MASIVO CON SCROLL */}
        <div className="w-[240px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono z-20">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between text-[9px] font-bold uppercase">
            <span>Precio (USDT)</span>
            <span>Cantidad</span>
          </div>

          {/* ASKS */}
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col-reverse">
            {asks.map((a, i) => (
              <div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] text-[10px] cursor-pointer hover:bg-red-500/10 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${a.total}%` }} />
                <span className="text-[#f84960] z-10">{a.p}</span>
                <span className="text-zinc-400 z-10">{a.q}</span>
              </div>
            ))}
          </div>

          <div className="p-3 text-lg font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">
            {selectedPrice}
          </div>

          {/* BIDS */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {bids.map((b, i) => (
              <div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] text-[10px] cursor-pointer hover:bg-green-500/10 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${b.total}%` }} />
                <span className="text-[#02c076] z-10">{b.p}</span>
                <span className="text-zinc-400 z-10">{b.q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTRO: CHART */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_main" ref={container} className="flex-1 w-full" />
          <div className="h-32 border-t border-[#2b2f36] bg-[#161a1e] p-3 overflow-y-auto">
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Posiciones Abiertas</span>
            {positions.map(p => (
              <div key={p.id} className="flex justify-between text-xs mt-2 border-l-2 border-[#f0b90b] pl-2">
                <span>{p.type} {p.lev}x @ {p.entry}</span>
                <button onClick={() => setPositions(positions.filter(x => x.id !== p.id))}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* DERECHA: PANEL DE ÓRDENES */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-5 flex flex-col gap-4 z-20">
          <div className="bg-[#2b3139] p-3 rounded-xl">
            <label className="text-[10px] text-zinc-500 font-bold uppercase">Precio</label>
            <input
              className="w-full bg-transparent text-right text-xl font-mono text-[#f0b90b] outline-none"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            />
          </div>
          <button onClick={() => setPositions([{ id: Date.now(), type: 'LONG', entry: selectedPrice, lev: leverage }, ...positions])} className="w-full bg-[#02c076] py-4 rounded-xl font-black uppercase text-sm shadow-lg active:scale-95 transition-all">Buy / Long</button>
          <button onClick={() => setPositions([{ id: Date.now(), type: 'SHORT', entry: selectedPrice, lev: leverage }, ...positions])} className="w-full bg-[#f84960] py-4 rounded-xl font-black uppercase text-sm shadow-lg active:scale-95 transition-all">Sell / Short</button>
        </div>

        {/* NIKIMARU BOT ARRASTRABLE */}
        <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[100] flex flex-col items-end pointer-events-none">
          {isChatOpen && (
            <div className="w-72 h-96 bg-[#1e2329] border border-[#f0b90b]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in zoom-in">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center font-black text-xs uppercase">
                <div className="flex items-center gap-2"><Bot size={18} /> Nikimaru AI</div>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] text-[#f0b90b]">
                Libro de órdenes listo jefe. Podés moverme donde quieras.
              </div>
              {/* INPUT DE CHAT CON BOTÓN DE ENVIAR */}
              <div className="p-3 bg-[#161a1e] flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-800 flex-1 rounded-xl px-3 text-[10px] outline-none text-white"
                  placeholder="Mensaje..."
                />
                <button
                  onClick={() => setMessage("")}
                  className="bg-[#f0b90b] text-black p-2 rounded-xl hover:scale-105 active:scale-90 transition-all"
                >
                  <Send size={14} fill="black" />
                </button>
              </div>
            </div>
          )}
          <div onMouseDown={handleMouseDown} className="pointer-events-auto p-1 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing">
            {!isChatOpen && <span className="bg-black/80 text-[#f0b90b] text-[9px] font-black px-3 py-1 rounded-full border border-[#f0b90b]/30">NIKIMARU</span>}
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-4 rounded-full shadow-2xl transition-all ${isChatOpen ? 'bg-zinc-800' : 'bg-[#f0b90b]'}`}>
              <Bot size={28} className={isChatOpen ? 'text-white' : 'text-black'} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}