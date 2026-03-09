'use client';

import { useState } from 'react';
import { Bot, Zap, Activity, TrendingUp, TrendingDown, Shield, Target } from 'lucide-react';

export default function NikimaruTerminal() {
  const [leverage, setLeverage] = useState(10);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Activity className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Nikimaru Terminal</h1>
            <p className="text-[10px] text-zinc-500 font-mono">BTC/USDT • REAL-TIME DATA</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase">Balance</p>
            <p className="text-lg font-mono font-bold text-green-500">$54,230.15</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* PANEL LATERAL IZQUIERDO: TRADING OPTIONS */}
        <div className="col-span-3 space-y-4">
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Leverage Control</h3>
            <div className="grid grid-cols-2 gap-2">
              {[10, 20, 50, 100, 125].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLeverage(lvl)}
                  className={`p-2 rounded font-mono text-sm border ${leverage === lvl
                      ? 'bg-yellow-500 border-yellow-500 text-black'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</h3>
            <button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 p-3 rounded-lg flex items-center justify-between group transition-all">
              <span className="font-bold uppercase text-xs">Market Long</span>
              <TrendingUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
            </button>
            <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-3 rounded-lg flex items-center justify-between group transition-all">
              <span className="font-bold uppercase text-xs">Market Short</span>
              <TrendingDown className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
            </button>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Risk Management</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
              Auto-stop loss at -15% based on {leverage}x leverage.
            </p>
          </div>
        </div>

        {/* PANEL CENTRAL: GRÁFICO (Ahora tiene más espacio) */}
        <div className="col-span-9">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-zinc-400 font-bold uppercase">Live Chart</span>
              </div>
            </div>

            {/* Aquí iría el embed de TradingView o tu canvas de gráfico */}
            <div className="text-zinc-700 font-mono text-sm flex flex-col items-center gap-2">
              <Target className="w-12 h-12 opacity-20 mb-2" />
              <p>[ CHART CANVAS AREA ]</p>
              <p className="text-[10px] opacity-50 uppercase tracking-[0.2em]">Waiting for data feed...</p>
            </div>

            {/* Decoración de rejilla para que no se vea vacío */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}