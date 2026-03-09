'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, GripHorizontal, Loader2 } from 'lucide-react';

// Añadimos props para recibir los datos del gráfico
interface NikimaruBubbleProps {
  price?: number;
  huella?: boolean;
  direction?: string;
}

export function NikimaruBubble({ price, huella, direction }: NikimaruBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'SISTEMA NIKIMARU INICIADO. Estoy vigilando el flujo institucional en español. ¿Qué quieres saber?' }
  ]);

  // Lógica de envío a la API
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          price: price || 0,
          huella: huella || false,
          direction: direction || 'NEUTRAL'
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'ERROR: No puedo conectar con mi cerebro. Revisa la consola.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica para arrastrar (Drag)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: window.innerWidth - e.clientX - 30,
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
    <div className="fixed z-[9999] flex flex-col items-end" style={{ right: `${position.x}px`, top: `${position.y}px` }}>
      {isOpen && (
        <div className="mb-4 w-80 h-[450px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div onMouseDown={() => setIsDragging(true)} className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">Nikimaru AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-[11px] font-mono scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl border ${m.role === 'ai' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300' : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                  }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-800 bg-black">
            <div className="relative flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="¿Cómo ves el mercado?..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-[10px] focus:outline-none focus:border-yellow-500/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-yellow-500 text-black p-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN BURBUJA */}
      <button
        onMouseDown={(e) => { if (!isOpen) setIsDragging(true); }}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-zinc-800' : 'bg-yellow-500 ring-4 ring-yellow-500/20'
          }`}
      >
        <Bot className={`${isOpen ? 'text-white' : 'text-black'} w-7 h-7`} />

        {/* Luz de Notificación (Solo si hay Huella) */}
        {huella && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
}