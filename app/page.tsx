'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Sparkles, Mic, MicOff, Camera, Smartphone, GripVertical } from 'lucide-react';

export default function NikimaruRobotOS() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [positions, setPositions] = useState<any[]>([]);

  // ESTADOS DE LA BURBUJA FLOTANTE
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Manejo del arrastre (Drag & Drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const offsetLeft = e.currentTarget.getBoundingClientRect().left;
    const offsetTop = e.currentTarget.getBoundingClientRect().top;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: window.innerWidth - moveEvent.clientX - 40,
        y: window.innerHeight - moveEvent.clientY - 40
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

      {/* BURBUJA DE ROBOT ARRASTRABLE */}
      <div
        ref={dragRef}
        style={{ bottom: `${position.y || 24}px`, right: `${position.x || 24}px` }}
        className="fixed z-[200] flex flex-col items-end"
      >
        {isChatOpen && (
          <div className="w-80 h-[480px] bg-[#161a1e] border border-[#f0b90b]/40 rounded-3xl shadow-[0_0_40px_rgba(240,185,11,0.2)] flex flex-col overflow-hidden mb-4 animate-in fade-in zoom-in duration-200">
            {/* Header del Robot */}
            <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center cursor-default">
              <div className="flex items-center gap-2">
                <Bot size={20} className="animate-bounce" />
                <span className="font-black text-xs uppercase italic">Nikimaru Bot</span>
              </div>
              <div className="flex gap-2">
                <Camera size={14} className="hover:scale-125 transition-transform cursor-pointer" />
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
              </div>
            </div>

            {/* Cuerpo del Chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-[11px] bg-gradient-to-b from-black/20 to-transparent">
              <div className="bg-[#f0b90b]/10 border border-[#f0b90b]/20 p-3 rounded-2xl text-[#f0b90b]">
                <p className="font-bold mb-1">SISTEMA ONLINE 🤖</p>
                Estoy listo jefe. Podés moverme donde quieras arrastrándome desde el icono. ¿Analizamos el gráfico?
              </div>
              {isListening && (
                <div className="flex gap-1 justify-center py-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-4 bg-[#f0b90b] animate-pulse" />)}
                </div>
              )}
            </div>

            {/* Input Multimodal */}
            <div className="p-3 bg-[#1e2329] border-t border-zinc-800">
              <div className="flex gap-2 items-center bg-[#0b0e11] rounded-xl px-2 py-1">
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-lg ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-[#f0b90b]'}`}
                >
                  <Mic size={18} />
                </button>
                <input
                  type="text"
                  placeholder="Hablar con Nikimaru..."
                  className="bg-transparent flex-1 border-none outline-none text-xs py-2"
                />
                <button className="text-[#f0b90b] p-2"><Send size={18} /></button>
              </div>
            </div>
          </div>
        )}

        {/* ICONO DEL ROBOT (DISPARADOR Y MANIJA) */}
        <div
          onMouseDown={handleMouseDown}
          className={`relative p-1 rounded-full cursor-grab active:cursor-grabbing transition-transform ${isDragging ? 'scale-110' : ''}`}
        >
          {/* Luz de fondo del robot */}
          <div className="absolute inset-0 bg-[#f0b90b] rounded-full blur-md opacity-20 animate-pulse" />

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 ${isChatOpen ? 'bg-[#2b3139] rotate-90' : 'bg-[#f0b90b]'}`}
          >
            {isChatOpen ? <X size={28} className="text-white" /> : <Bot size={32} className="text-black" />}
          </button>

          {/* Pequeña manija para indicar que se arrastra */}
          {!isChatOpen && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-black px-2 rounded-full border border-zinc-700 text-zinc-500 py-0.5">
              MOVER
            </div>
          )}
        </div>
      </div>

      {/* TERMINAL (HEADER + CHART + SIDEBAR) */}
      <div className="h-10 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold text-xs">
          <Zap size={14} fill="#f0b90b" /> <span>NIKIMARU FUTURES</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 border-r border-zinc-800 bg-[#161a1e]">
          <div className="p-4 text-[9px] text-zinc-600 font-mono">ORDER_BOOK_SIM_ACTIVE</div>
        </div>
        <div className="flex-1 bg-black">
          <div id="tv_chart_stable" ref={container} className="w-full h-full" />
        </div>
        <div className="w-64 border-l border-zinc-800 bg-[#161a1e] p-4">
          <button className="w-full bg-[#02c076] py-3 rounded font-black text-xs uppercase shadow-lg shadow-green-900/20 active:translate-y-0.5 transition-all">Abrir Long</button>
          <button className="w-full bg-[#f84960] py-3 rounded font-black text-xs uppercase mt-2 shadow-lg shadow-red-900/20">Abrir Short</button>
        </div>
      </div>
    </div>
  );
}