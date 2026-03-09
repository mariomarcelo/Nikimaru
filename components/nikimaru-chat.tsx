'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ChartMessage } from '@/lib/types';

interface NikimaruChatProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
}

// Simulated AI responses based on Wyckoff and SMC concepts
const generateAIResponse = (
  question: string,
  price: number,
  isHuellaActive: boolean
): string => {
  const questionLower = question.toLowerCase();

  // Price analysis
  if (questionLower.includes('price') || questionLower.includes('precio')) {
    return `[NIKIMARU_AI] Current BTC price: $${price.toLocaleString()}. ${isHuellaActive
        ? 'Volume spike detected. Smart Money may be accumulating. Watch for manipulation below recent lows before potential markup phase.'
        : 'No significant volume anomalies. Market in ranging phase. Wait for clear Order Block formation.'
      }`;
  }

  // Entry analysis
  if (questionLower.includes('entry') || questionLower.includes('entrada') || questionLower.includes('buy') || questionLower.includes('compra')) {
    if (isHuellaActive) {
      return `[NIKIMARU_AI] HUELLA ACTIVE suggests institutional activity. Look for:
1. Sweep of liquidity below equal lows
2. Change of Character (CHoCH) on lower TF
3. Entry at Order Block with confirmation
Risk: Always respect your $80 max loss rule.`;
    }
    return `[NIKIMARU_AI] No clear entry signal. Market showing distribution characteristics. Wait for:
1. Spring or shakeout at support
2. Volume confirmation (HUELLA activation)
3. Break of market structure`;
  }

  // Wyckoff analysis
  if (questionLower.includes('wyckoff') || questionLower.includes('phase') || questionLower.includes('fase')) {
    return `[NIKIMARU_AI] Wyckoff Phase Analysis:
- Current volume pattern: ${isHuellaActive ? 'ACCUMULATION SIGNAL' : 'NO CLEAR PHASE'}
- Watch for: PS (Preliminary Support), SC (Selling Climax), AR (Automatic Rally)
- Smart Money Concept: Identify Order Blocks and Fair Value Gaps
- Key: Wait for Spring before LONG entries`;
  }

  // SMC analysis
  if (questionLower.includes('smc') || questionLower.includes('smart money') || questionLower.includes('liquidity')) {
    return `[NIKIMARU_AI] SMC Analysis @ $${price.toLocaleString()}:
- Liquidity pools: Check equal highs/lows for sweep targets
- Order Blocks: Previous candle before impulsive move
- Fair Value Gaps: Imbalance zones for potential retracement
- Breaker Blocks: Failed Order Blocks become resistance/support
HUELLA Status: ${isHuellaActive ? 'ACTIVE - Institutional volume detected' : 'INACTIVE - Retail flow'}`;
  }

  // Stop Loss
  if (questionLower.includes('stop') || questionLower.includes('sl') || questionLower.includes('loss')) {
    return `[NIKIMARU_AI] Risk Management Protocol:
- Max Loss: $80 USD (fixed)
- Commission: $0.80 USD
- SL Placement: Below/Above recent swing
- Auto Break-Even: Activates at 1:1 ratio
- Never move SL against the trade direction`;
  }

  // Take Profit
  if (questionLower.includes('take profit') || questionLower.includes('tp') || questionLower.includes('target')) {
    return `[NIKIMARU_AI] Take Profit Strategy:
- Minimum R:R = 1:2 (system default)
- Target liquidity zones (equal highs for LONG)
- Consider partial exits at 1:1
- Trail SL after Break-Even activation
- Watch for reversal patterns at TP zones`;
  }

  // Default response
  return `[NIKIMARU_AI] Analysis for BTC @ $${price.toLocaleString()}:
- HUELLA: ${isHuellaActive ? 'ACTIVE - Volume anomaly detected' : 'INACTIVE'}
- Protocol: Wait for confirmation before execution
- Risk: $80 max loss per trade
Ask about: entry, wyckoff, smc, stop loss, or take profit for detailed analysis.`;
};

export function NikimaruChat({
  currentPrice,
  isHuellaActive,
  timeframe,
}: NikimaruChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChartMessage[]>([
    {
      role: 'assistant',
      content: `[NIKIMARU_AI] Terminal initialized. Connected to BTC/USDT ${timeframe} stream. Ready for analysis. Type your question or ask about: entry, wyckoff, smc, liquidity, stop loss, take profit.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChartMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, currentPrice, isHuellaActive);
      const assistantMessage: ChartMessage = {
        role: 'assistant',
        content: aiResponse,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-card border border-border rounded-l-lg transition-all lg:hidden ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <ChevronLeft className="w-5 h-5 text-gold" />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed lg:relative right-0 top-0 h-full w-80 bg-card border-l border-border z-40 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gold" />
            <span className="text-sm font-bold text-foreground">NIKIMARU AI</span>
            <Sparkles className="w-3 h-3 text-gold animate-pulse" />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-secondary rounded"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-secondary/50 border-b border-border text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>BTC: ${currentPrice.toLocaleString()}</span>
            <span className={isHuellaActive ? 'text-gold' : ''}>
              HUELLA: {isHuellaActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${message.role === 'user'
                    ? 'bg-gold/20 text-gold'
                    : 'bg-secondary text-foreground'
                  }`}
              >
                <pre className="whitespace-pre-wrap font-mono">{message.content}</pre>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-lg p-3 text-xs">
                <span className="text-gold animate-pulse">Analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nikimaru..."
              className="flex-1 bg-secondary border-border text-foreground text-xs"
            />
            <button
              type="submit"
              className="p-2 bg-gold text-black rounded-md hover:bg-gold/80 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

