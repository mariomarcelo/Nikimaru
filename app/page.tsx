'use client';

import React, { useState } from 'react';
import { TradingChart } from '@/components/trading-chart';
import { NikimaruChat } from '@/components/nikimaru-chat';
import { Zap } from 'lucide-react';

export default function NikimaruTerminal() {
  const [price, setPrice] = useState(66151.79);

  return (
    <main className="h-screen w-full bg-black text-white font-mono flex flex-col overflow-hidden">
      <header className="border-b border-[#d4af37]/20 p-2 flex justify-between items-center bg-black">
        <div className="flex items-center gap-2">
          <Zap className="text-[#d4af37] w-4 h-4 fill-current" />
          <span className="font-bold text-xs tracking-tighter uppercase">Nikimaru HFT Terminal</span>
        </div>
        <div className="text-[10px] text-[#d4af37]">BTC/USD: ${price.toLocaleString()}</div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[2] relative border-r border-[#d4af37]/10 bg-black">
          <TradingChart onPriceUpdate={(p) => setPrice(p)} />
        </div>

        <div className="flex-1 min-w-[320px] p-2 bg-[#0a0a0a]">
          <NikimaruChat />
        </div>
      </div>
    </main>
  );
}