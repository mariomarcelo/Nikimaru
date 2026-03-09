'use client';

import { useChat } from 'ai/react';
import { Send, Terminal, Zap } from 'lucide-react';

interface ChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
}

export function NikimaruChat({ currentPrice, isHuellaActive, timeframe }: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      price: currentPrice,
      huella: isHuellaActive,
      tf: timeframe
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-gold/20 rounded-lg font-mono overflow-hidden">
      <div className="bg-gold/10 p-2 border-b border-gold/20 text-[10px] text-gold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3" /> [NIKIMARU AI ONLINE]
        </div>
        {isHuellaActive && <Zap className="w-3 h-3 animate-pulse text-gold" />}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[11px]">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-white/70' : 'text-green-400'}>
            <span className="opacity-40">[{m.role === 'user' ? 'MARIUS' : 'NIKIMARU'}]</span> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-gold/20 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Comando de trading..."
          className="flex-1 bg-transparent text-white text-[11px] outline-none"
        />
        <button type="submit" disabled={isLoading} className="text-gold">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}