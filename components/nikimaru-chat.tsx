'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react'; // Conector real
import {
  Send,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
}

export function NikimaruChat({
  currentPrice,
  isHuellaActive,
  timeframe,
}: NikimaruChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Usamos useChat para conectar con app/api/chat/route.ts
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `[NIKIMARU_AI] Terminal inicializada. Conectado a BTC/USDT ${timeframe}. Precio: $${currentPrice.toLocaleString()}. Listo para el análisis real, Marius.`,
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-card border border-border rounded-l-lg transition-all lg:hidden ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <ChevronLeft className="w-5 h-5 text-gold" />
      </button>

      <div
        className={`fixed lg:relative right-0 top-0 h-full w-80 bg-card border-l border-border z-40 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gold" />
            <span className="text-sm font-bold text-foreground">NIKIMARU AI</span>
            <Sparkles className="w-3 h-3 text-gold animate-pulse" />
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 hover:bg-secondary rounded">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-2 bg-secondary/50 border-b border-border text-xs text-muted-foreground font-mono">
          <div className="flex justify-between">
            <span>BTC: ${currentPrice.toLocaleString()}</span>
            <span className={isHuellaActive ? 'text-gold' : ''}>
              HUELLA: {isHuellaActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed font-mono ${m.role === 'user' ? 'bg-gold/20 text-gold' : 'bg-secondary text-foreground'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start text-gold animate-pulse text-[10px] font-mono p-2">
              ESCANEANDO FLUJO...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Pregunta a Nikimaru..."
              className="flex-1 bg-secondary border-border text-foreground text-xs font-mono"
            />
            <button type="submit" disabled={isLoading} className="p-2 bg-gold text-black rounded-md hover:bg-gold/80 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}