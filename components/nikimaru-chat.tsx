'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
}

export function NikimaruChat({ currentPrice, isHuellaActive, timeframe }: NikimaruChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Conexión establecida. El algoritmo Nikimaru está en línea. Esperando rastro institucional..." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          price: currentPrice,
          huella: isHuellaActive,
          tf: timeframe,
          history: messages // Enviamos el historial para que tenga memoria
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error en el enlace neuronal. Reintenta." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header del Chat */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Nikimaru Intelligence</span>
        </div>
        {isHuellaActive && <div className="flex items-center gap-1 animate-pulse text-gold text-[9px] font-black"><Zap size={10} /> LIVE ANALYSIS</div>}
      </div>

      {/* Área de Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide text-xs font-mono">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl ${m.role === 'user'
                ? 'bg-zinc-800 text-zinc-200 rounded-tr-none'
                : 'bg-gold/10 border border-gold/20 text-gold rounded-tl-none italic'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gold animate-pulse text-[10px]">Nikimaru está procesando el flujo...</div>}
      </div>

      {/* Input de comandos */}
      <form onSubmit={sendMessage} className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre el precio o la huella..."
          className="flex-1 bg-transparent border-none text-zinc-300 text-xs focus:ring-0 outline-none"
        />
        <button type="submit" className="p-2 hover:bg-gold/20 rounded-lg transition-colors">
          <Send size={14} className="text-gold" />
        </button>
      </form>
    </div>
  );
}