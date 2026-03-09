'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, Camera, Smartphone } from 'lucide-react';

export default function NikimaruProTerminalV6() {
  const container = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DEL ROBOT Y CHAT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // ESTADO DEL ORDER BOOK (MÁS ÓRDENES)
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // Generador de órdenes masivo
  useEffect(() => {
    const generateOrders = () => {
      const base = parseFloat(selectedPrice) || 68250;
      // Generamos 20 niveles de cada lado
      const newAsks = Array.from({ length: 20 }, (_, i) => ({
        p: (base + (20 - i) * 0.4 + (Math.random() * 0.2)).toFixed(1),
        q: (Math.random() * 4 + 0.1).toFixed(3)
      }));
      const newBids = Array.from({ length: 20 }, (_, i) => ({
        p: (base - i * 0.4 - (Math.random() * 0.2)).toFixed(1),
        q: (Math.random() * 4 + 0.1).toFixed(3)
      }));
      setOrderBook({ asks: newAsks, bids: newBids });
    };

    generateOrders();
    const interval = setInterval(generateOrders, 1000);
    return () => clearInterval(interval);
  }, [selectedPrice]);

  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = { id: Date.now(), type, entry: selectedPrice, leverage };
    setPositions([newPos, ...positions]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const onMouseMove = (moveEvent: MouseEvent) => {
      setBotPos({
        x: window.innerWidth - moveEvent.clientX - 30,
        y: window.innerHeight - moveEvent.clientY - 30
      });
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
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_stable"
    });
    if (container.current && container.current.children.length === 0) container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-20">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold uppercase tracking-tight">
          <Zap size={18} fill="#f0b90b" />
          <span className="text-base">Nikimaru <span className="text-white font-light">Terminal</span></span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 bg-black/30 px-3 py-1 rounded-full border border-zinc-800">
          BTCUSDT <span className="text-[#02c076] animate-pulse">● LIVE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* IZQUIERDA: ORDER BOOK MASIVO */}
        <div className="w-[220px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[10px] font-mono z-10">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px] font-bold">
            <span>Precio (USDT)</span>
            <span>Monto</span>
          </div>

          {/* ASKS (Ventas) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col justify-end text-[#f84960]">
            {orderBook.asks.map((ask, i) => (
              <div key={i} className="flex justify-between px-2 cursor-pointer hover:bg-red-500/10 py-[1px] relative group" onClick={() => setSelectedPrice(ask.p)}>
                <div className="absolute inset-0 bg-red-500/5 origin-right scale-x-[0.3] group-hover:scale-x-100 transition-transform" />
                <span className="relative">{ask.p}</span>
                <span className="relative text-zinc-400">{ask.q}</span>
              </div>
            ))}
          </div>

          {/* PRECIO ACTUAL */}
          <div className="p-3 text-xl font-bold text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center flex items-center justify-center gap-2">
            <Zap size={14} fill="#02c076" />
            {selectedPrice}
          </div>

          {/* BIDS (Compras) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide text-[#02c076]">
            {orderBook.bids.map((bid, i) => (
              <div key={i} className="flex justify-between px-2 cursor-pointer hover:bg-green-500/10 py-[1px] relative group" onClick={() => setSelectedPrice(bid.p)}>
                <div className="absolute inset-0 bg-green-500/5 origin-left scale-x-[0.3] group-hover:scale-x-100 transition-transform" />
                <span className="relative">{bid.p}</span>
                <span className="relative text-zinc-400">{bid.q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTRO: CHART */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative z-0">
          <div className="flex-1 relative">
            <div id="tv_chart_stable" ref={container} className="w-full h-full" />
          </div>

          {/* TABLA DE POSICIONES */}
          <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <div className="p-2 text-[9px] text-zinc-500 uppercase font-black tracking-widest border-b border-zinc-800">Órdenes Abiertas</div>
            <table className="w-full text-[11px]">
              <tbody className="divide-y divide-zinc-800">
                {positions.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className={`p-2 font-bold ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type} {p.leverage}x</td>
                    <td className="p-2 font-mono text-zinc-400">Entrada: {p.entry}</td>
                    <td className="p-2 text-right">
                      <button onClick={() => setPositions(positions.filter(x => x.id !== p.id))} className="text-zinc-600 hover:text-white mr-2">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL DE TRADING */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 z-10">
          <div className="bg-[#2b3139] p-4 rounded-xl border border-zinc-700">
            <span className="text-[9px] text-zinc-500 font-black uppercase block mb-2">Precio de Entrada</span>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-xs">USDT</span>
              <input
                type="text"
                className="bg-transparent text-right text-xl outline-none font-mono text-[#f0b90b] w-full"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleTrade('LONG')}
              className="w-full bg-[#02c076] hover:bg-[#03d382] py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-green-900/10 active:scale-95 transition-all"
            >
              Comprar / Long
            </button>
            <button
              onClick={() => handleTrade('SHORT')}
              className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-4 rounded-xl font-black uppercase text-xs shadow-lg shadow-red-900/10 active:scale-95 transition-all"
            >
              Vender / Short
            </button>
          </div>
        </div>

        {/* NIKIMARU BOT (ARRASTRABLE) */}
        <div
          style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }}
          className="fixed z-[100] flex flex-col items-end pointer-events-none"
        >
          {isChatOpen && (
            <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in zoom-in">
              <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2"><Bot size={20} /><span className="font-black text-xs uppercase tracking-widest">Nikimaru AI</span></div>
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-3 rounded-2xl text-[#f0b90b] leading-relaxed">
                  He cargado 40 niveles de órdenes en el libro para que veas la liquidez real. El botón de envío está listo. ¿Qué orden ejecutamos hoy?
                </div>
              </div>

              {/* CHAT INPUT CON BOTÓN DE ENVIAR */}
              <div className="p-4 bg-[#1e2329] border-t border-zinc-800">
                <div className="flex items-center gap-2 bg-[#0b0e11] rounded-2xl p-2 border border-zinc-800 focus-within:border-[#f0b90b]/50">
                  <button className="text-zinc-500 hover:text-[#f0b90b] p-1"><Mic size={18} /></button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribir mensaje..."
                    className="bg-transparent flex-1 border-none outline-none text-[11px] py-1 px-1"
                  />
                  <button
                    onClick={() => { if (chatInput) setChatInput(''); }}
                    className="bg-[#f0b90b] text-black p-2 rounded-xl hover:bg-[#d9a508] transition-colors"
                  >
                    <Send size={16} fill="black" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div
            onMouseDown={handleMouseDown}
            className={`pointer-events-auto p-1 flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing ${isDragging ? 'scale-110' : ''}`}
          >
            {!isChatOpen && (
              <span className="bg-black/90 text-[#f0b90b] text-[9px] font-black px-3 py-1 rounded-full border border-[#f0b90b]/30 shadow-2xl backdrop-blur-sm">
                NIKIMARU
              </span>
            )}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-5 rounded-full shadow-[0_0_30px_rgba(240,185,11,0.2)] transition-all ${isChatOpen ? 'bg-zinc-800 rotate-90' : 'bg-[#f0b90b]'}`}
            >
              <Bot size={32} className={isChatOpen ? 'text-white' : 'text-black'} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}