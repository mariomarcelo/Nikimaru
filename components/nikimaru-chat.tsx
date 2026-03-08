'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
}

const generateAIResponse = (question: string, price: number, isHuellaActive: boolean): string => {
  const questionLower = question.toLowerCase();

  if (questionLower.includes('price') || questionLower.includes('precio')) {
    return `[NIKIMARU_AI] Current BTC price: $${price.toLocaleString()}. ${isHuellaActive
      ? 'Volume spike detected. Smart Money may be accumulating.'
      : 'No significant volume anomalies. Market in ranging phase.'
      }`;
  }

  if (questionLower.includes('entry') || questionLower.includes('entrada') || questionLower.includes('buy')) {
    return `[NIKIMARU_AI] HUELLA ${isHuellaActive ? 'ACTIVE' : 'INACTIVE'}. Look for Sweep of liquidity and CHoCH. Risk: $80 max loss.`;
  }

  if (questionLower.includes('wyckoff') || questionLower.includes('fase')) {
    return `[NIKIMARU_AI] Wyckoff Analysis: Current volume pattern: ${isHuellaActive ? 'ACCUMULATION SIGNAL' : 'NO CLEAR PHASE'}. Wait for Spring.`;
  }

  return `[NIKIMARU_AI] Analysis for BTC @ $${price.toLocaleString()}: Protocol active. Ask about: entry, wyckoff, smc, or stop loss.`;
};

export function NikimaruChat({ currentPrice, isHuellaActive, timeframe }: NikimaruChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: `[NIKIMARU_AI] Terminal initialized. Ready for analysis. BTC: $${currentPrice.toLocaleString()}` }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(input, currentPrice, isHuellaActive);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[400px] bg-black/80 border border-gold/30 rounded-lg overflow-hidden font-mono shadow-2xl">
      <div className="bg-gold/10 p-3 border-b border-gold/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gold" />
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Nikimaru AI Core</span>
          <Sparkles className="w-3 h-3 text-gold animate-pulse" />
        </div>
        <div className="text-[9px] text-gold/50 font-bold">BTC: ${currentPrice.toLocaleString()}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded ${m.role === 'user' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-white/5 text-gray-300 border border-white/10'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-gold text-[9px] animate-pulse">ANALIZANDO BLOQUES...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-black/40 border-t border-gold/20 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribir comando..."
          className="flex-1 bg-transparent border-none text-white text-[11px] outline-none placeholder:text-gray-600"
        />
        <button type="submit" className="text-gold hover:scale-110 transition-transform">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}