'use client';

import { useRef, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  Send,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
// CORRECCIÓN: Usamos la nueva ruta de la SDK de Vercel para evitar el error "Module not found"
import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import type { TimeFrame, CandleDirection } from '@/lib/types';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: TimeFrame;
  isRayoDorado: boolean;
  candleDirection: CandleDirection;
}

export function NikimaruChat({
  currentPrice,
  isHuellaActive,
  timeframe,
  isRayoDorado,
  candleDirection
}: NikimaruChatProps) {
  // Configuración del Chat con el backend real
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      currentMarketData: {
        precio: currentPrice,
        huellaActiva: isHuellaActive,
        rayoDorado: isRayoDorado,
        direccion: candleDirection,
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
    <div className="flex flex-col h-full w-80 bg-black border-l border-zinc-800 transition-transform duration-300">
      {/* Header del Chat */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-bold text-white uppercase tracking-tighter">Nikimaru AI</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      {/* Status Bar en tiempo real */}
      <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-500">
        <div className="flex justify-between items-center">
          <span>BTC: ${currentPrice.toLocaleString()}</span>
          <span className={isHuellaActive ? "text-yellow-500" : "text-zinc-600"}>
            HUELLA: {isHuellaActive ? 'DETECTADA 🐋' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Panel de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed font-mono ${m.role === 'user'
                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                : 'bg-zinc-800/80 border border-zinc-700 text-zinc-300'
              }`}>
              <div className="text-[9px] uppercase opacity-50 mb-1 font-black">
                {m.role === 'user' ? 'Cazador' : 'Mentor'}
              </div>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 rounded-lg p-3 text-xs animate-pulse text-yellow-500 font-mono">
              Analizando huella...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Comandos */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Analizá este volumen..."
            className="flex-1 bg-black border-zinc-800 text-white text-xs focus-visible:ring-yellow-500"
          />
          <button
            type="submit"
            className="p-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}