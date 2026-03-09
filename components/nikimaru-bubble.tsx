'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, GripHorizontal } from 'lucide-react';

export function NikimaruBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 }); // Posición inicial
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Lógica para arrastrar (Drag)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: window.innerWidth - e.clientX - 30, // Calculado desde la derecha
        y: e.clientY - 20
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed z-[9999] flex flex-col items-end"
      style={{ right: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* VENTANA DE CHAT */}
      {isOpen && (
        <div className="mb-4 w-80 h-[450px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header del Chat */}
          <div
            onMouseDown={() => setIsDragging(true)}
            className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">Nikimaru AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-[11px] font-mono">
            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-zinc-400">
              <span className="text-yellow-500 font-bold block mb-1">SISTEMA:</span>
              Hola. Estoy monitoreando el flujo de órdenes en TradingView. Si detecto una anomalía de volumen o una huella institucional, te avisaré aquí mismo.
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-800 bg-black">
            <div className="relative">
              <input
                type="text"
                placeholder="Pregunta sobre la tendencia..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-[10px] focus:outline-none focus:border-yellow-500/50"
              />
              <Send className="absolute right-3 top-2.5 w-3 h-3 text-zinc-600" />
            </div>
          </div>
        </div>
      )}

      {/* BURBUJA FLOTANTE */}
      <button
        onMouseDown={(e) => {
          if (!isOpen) setIsDragging(true);
        }}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-zinc-800' : 'bg-yellow-500 ring-4 ring-yellow-500/20'
          }`}
      >
        {isOpen ? (
          <GripHorizontal className="text-white w-6 h-6" />
        ) : (
          <Bot className="text-black w-7 h-7" />
        )}

        {/* Notificación de señal (Luz) */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
}