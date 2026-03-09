'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronLeft, Terminal, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ChartMessage, TimeFrame, CandleDirection, Position } from '@/lib/types';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: TimeFrame;
  isRayoDorado: boolean;
  candleDirection: CandleDirection;
  position: Position | null;
}

export function NikimaruChat({
  currentPrice,
  isHuellaActive,
  timeframe,
  isRayoDorado,
  candleDirection,
  position
}: NikimaruChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChartMessage[]>([
    {
      role: 'assistant',
      content: `[TERMINAL NIKIMARU] Sistema listo. BTC/USDT en ${timeframe}. Esperando rastro de Smart Money...`,
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChartMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Respuesta rápida del Mentor
    setTimeout(() => {
      let response = `[ANALISIS] BTC @ $${currentPrice.toLocaleString()}. `;
      if (isRayoDorado) {
        response += `⚡ RAYO DORADO DETECTADO: Confirmación ${candleDirection}. Es momento de ejecutar la caza.`;
      } else if (isHuellaActive) {
        response += `🐋 HUELLA ACTIVA: Hay volumen institucional, pero aún falta el Rayo para confirmar dirección.`;
      } else {
        response += `Mercado en rango. Sin huella clara de ballenas. Paciencia.`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <>
      {/* Botón Toggle Mobile con color Gold del CSS */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-secondary border border-border rounded-l-lg lg:hidden ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <ChevronLeft className="w-5 h-5 text-gold" />
      </button>

      <div className={`fixed lg:relative right-0 top-0 h-full w-80 bg-card border-l border-border z-40 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

        {/* Header con Terminal Icon */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-black">
          <div className="flex items-center gap-2">
            <Terminal className={`w-5 h-5 ${isRayoDorado ? 'text-gold animate-pulse-gold' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-bold tracking-widest ${isRayoDorado ? 'animate-glow-gold text-gold' : 'text-foreground'}`}>
              MENTOR AI
            </span>
          </div>
          <Sparkles className={`w-4 h-4 ${isHuellaActive ? 'text-gold animate-spin' : 'text-muted'}`} />
        </div>

        {/* Status Bar usando variables de trading del CSS */}
        <div className="px-4 py-2 bg-muted/30 border-b border-border text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">BTC: <span className="text-foreground font-bold">${currentPrice.toLocaleString()}</span></span>
            <span className={isHuellaActive ? 'text-gold animate-glow-gold' : 'text-muted-foreground'}>
              HUELLA: {isHuellaActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Mensajes con Scrollbar personalizado del CSS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-md p-3 border ${m.role === 'user'
                  ? 'bg-secondary border-border text-foreground'
                  : 'bg-black border-gold/20 text-gold shadow-[0_0_10px_rgba(255,215,0,0.05)]'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de entrada */}
        <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Analizar volumen..."
              className="flex-1 bg-input border-border text-foreground text-xs focus:ring-gold"
            />
            <button type="submit" className="p-2 bg-gold text-black rounded hover:opacity-80 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}