'use client';

import { useChat } from 'ai/react';
import { Send, Terminal } from 'lucide-react';

export function NikimaruChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-[350px] bg-black/60 border border-gold/20 rounded-lg font-mono">
      <div className="bg-gold/10 p-2 border-b border-gold/20 text-[10px] text-gold flex items-center gap-1">
        <Terminal className="w-3 h-3" /> [NIKIMARU CORE ONLINE]
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[11px] text-white">
        {messages.length === 0 && <div className="text-gray-500 italic">[SISTEMA LISTO]</div>}
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-gold/80' : 'text-green-400'}>
            <span className="opacity-50">[{m.role === 'user' ? 'MARIUS' : 'NIKIMARU'}]</span> {m.content}
          </div>
        ))}
        {isLoading && <div className="text-gold animate-pulse text-[9px]">PENSANDO...</div>}
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-gold/20 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe comando..."
          className="flex-1 bg-transparent text-white text-[11px] outline-none"
        />
        <button type="submit" disabled={isLoading} className="text-gold">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}