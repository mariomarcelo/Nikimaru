'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Mic, Camera, Smartphone } from 'lucide-react';

export default function NikimaruUltimateTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DEL ROBOT
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

  // Funciones de Trading
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = { id: Date.now(), type, entry: selectedPrice, leverage };
    setPositions([newPos, ...positions]);
  };

  // Manejo del Drag (Movimiento del Robot)
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
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-10">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold uppercase tracking-tighter">
          <Zap size={20} fill="#f0b90b" />
          <span className="text-lg">Nikimaru <span className="text-white font-light">Terminal</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* IZQUIERDA: LIBRO DE ÓRDENES (RECUPERADO) */}
        <div className="w-[200px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[10px] font-mono z-10">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px]">
            <span>Precio</span>
            <span>Cantidad</span>
          </div>
          <div className="flex-1 flex flex-col justify-end text-[#f84960] overflow-hidden">
            <div className="flex justify-between px-2 cursor-pointer hover:bg-white/5" onClick={() => setSelectedPrice('68310.5')}><span>68310.5</span><span>0.412</span></div>
            <div className="flex justify-between px-2 cursor-pointer hover:bg-white/5" onClick={() => setSelectedPrice('68305.2')}><span>68305.2</span><span>1.105</span></div>
          </div>
          <div className="p-3 text-xl font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center">
            68,250.40
          </div>
          <div className="flex-1 text-[#02c076] overflow-hidden">
            <div className="flex justify-between px-2 cursor-pointer hover:bg-white/5" onClick={() => setSelectedPrice('68245.8')}><span>68245.8</span><span>0.890</span></div>
            <div className="flex justify-between px-2 cursor-pointer hover:bg-white/5" onClick={() => setSelectedPrice('68240.1')}><span>68240.1</span><span>2.441</span></div>
          </div>
        </div>

        {/* CENTRO: GRÁFICO Y POSICIONES */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative z-0">
          <div className="flex-1 relative">
            <div id="tv_chart_stable" ref={container} className="w-full h-full" />
          </div>
          <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto p-2">
            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Posiciones ({positions.length})</div>
            <table className="w-full text-[11px]">
              <tbody className="divide-y divide-zinc-800">
                {positions.map(p => (
                  <tr key={p.id} className="text-zinc-300">
                    <td className={`p-1 font-bold ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{p.type}</td>
                    <td className="p-1 font-mono">${p.entry}</td>
                    <td className="p-1 text-right">
                      <button onClick={() => setPositions(positions.filter(x => x.id !== p.id))} className="text-zinc-600 hover:text-white"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL DE CONTROL (BOTONES ACTIVOS) */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 z-10">
          <div className="bg-[#2b3139] p-3 rounded-lg border border-transparent focus-within:border-[#f0b90b]">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Precio</span>
            <input
              type="text"
              className="bg-transparent w-full text-right text-lg outline-none font-mono text-white"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleTrade('LONG')}
              className="w-full bg-[#02c076] hover:bg-[#03d382] py-4 rounded-xl font-black uppercase transition-all active:scale-95"
            >
              Comprar / Long
            </button>
            <button
              onClick={() => handleTrade('SHORT')}
              className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-4 rounded-xl font-black uppercase transition-all active:scale-95"
            >
              Vender / Short
            </button>
          </div>
        </div>

        {/* ROBOT ARRASTRABLE (EN UNA CAPA SUPERIOR INDEPENDIENTE) */}
        <div
          style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }}
          className="fixed z-[50] flex flex-col items-end pointer-events-none"
        >
          {isChatOpen && (
            <div className="w-72 h-96 bg-[#1e2329] border border-[#f0b90b]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto animate-in fade-in zoom-in duration-200">
              <div className="p-3 bg-[#f0b90b] text-black flex justify-between items-center">
                <div className="flex items-center gap-2"><Bot size={18} /><span className="text-[10px] font-black uppercase">Nikimaru OS</span></div>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3">
                <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-2 rounded-xl text-[#f0b90b]">¡Sistemas listos! Arrastrame desde mi icono si te molesto.</div>
              </div>
              <div className="p-3 bg-[#161a1e] flex gap-2">
                <button onClick={() => setIsListening(!isListening)} className={`p-2 rounded-lg ${isListening ? 'bg-red-500' : 'bg-zinc-800'}`}><Mic size={14} /></button>
                <input className="bg-zinc-800 flex-1 rounded-lg px-2 text-[10px] outline-none" placeholder="Preguntar..." />
              </div>
            </div>
          )}

          <div
            onMouseDown={handleMouseDown}
            className={`pointer-events-auto p-1 rounded-full cursor-grab active:cursor-grabbing ${isDragging ? 'scale-110' : ''}`}
          >
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-4 rounded-full shadow-2xl transition-all ${isChatOpen ? 'bg-zinc-800' : 'bg-[#f0b90b]'}`}
            >
              <Bot size={28} className={isChatOpen ? 'text-white' : 'text-black'} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}