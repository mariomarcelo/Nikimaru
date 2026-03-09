'use client';

import { useState } from 'react';
import { NikimaruBubble } from '@/components/nikimaru-bubble';

export default function Page() {
  const [price] = useState(65000.50);
  const [huella] = useState(false);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter">Nikimaru Terminal</h1>
      <div className="p-10 border border-zinc-800 rounded-2xl bg-zinc-950 text-zinc-500 font-mono text-sm">
        [ Gráfico de Trading Activo ]
      </div>
      <NikimaruBubble price={price} huella={huella} direction="NEUTRAL" />
    </div>
  );
}