'use client';

import { useRef, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  Send
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';

// Definimos los Props para que coincidan con lo que envía page.tsx
interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
  isRayoDorado: boolean;
}

export function NikimaruChat({
  currentPrice,
  isHuellaActive,
  timeframe,
  isRayoDorado
}: NikimaruChatProps) {

  // useChat nos da todo lo necesario: messages, input, y las funciones de manejo
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      currentMarketData: {
        precio: currentPrice,
        huellaActiva: isHuellaActive,
        rayoDorado: isRayoDorado,
        temporalidad: timeframe,
      }
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-card border-l border-border transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-black/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-bold text-foreground">NIKIMARU AI</span>
          <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-border text-[10px] font-mono text-muted-foreground">
        <div className="flex justify-between">
          <span>BTC: ${currentPrice.toLocaleString()}</span>
          <span className={isHuellaActive ? 'text-yellow-500 font-bold' : ''}>
            HUELLA: {isHuellaActive ? 'DETECTADA 🐋' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Panel de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
        {messages.length === 0 && (
          <div className="text-center text-[10px] text-zinc-600 mt-10 uppercase tracking-widest">
            Esperando señal institucional...
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed font-mono ${m.role === 'user'
                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-100'
                }`}
            >
              <div className="text-[9px] uppercase opacity-40 mb-1 font-black">
                {m.role === 'user' ? 'Cazador' : '🏛️ Mentor'}
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs animate-pulse text-yellow-500 font-mono">
              Analizando Order Flow...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Comandos */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-black">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Analizá este movimiento..."
            className="flex-1 bg-zinc-900 border-zinc-800 text-foreground text-xs focus-visible:ring-yellow-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-500 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}