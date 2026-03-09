'use client';

import { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Shield, Target, ChevronRight } from 'lucide-react';

export default function NikimaruTerminal() {
  const [leverage, setLeverage] = useState(10);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans overflow-hidden">
      {/* BARRA SUPERIOR (HEADER) */}
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
            <Activity className="text-black w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic">Nikimaru <span className="text-yellow-500">Terminal</span></h1>
        </div>
        <div className="flex gap-8 font-mono text-xs">
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 uppercase text-[9px]">Price BTC</span>
            <span className="text-green-500 font-bold">$68,432.10</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 uppercase text-[9px]">24h Change</span>
            <span className="text-green-400">+4.2%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)]">

        {/* PANEL IZQUIERDO: CONTROLES DE TRADING */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* APALANCAMIENTO */}
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 tracking-[0.2em]">Leverage Control</h3>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50, 75, 100, 125].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLeverage(lvl)}
                  className={`py-2 rounded-lg font-mono text-xs border transition-all ${leverage === lvl
                      ? 'bg-yellow-500 border-yellow-500 text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                >
                  {lvl}x
                </button>
              ))}
            </div>
          </div>

          {/* ACCIONES RÁPIDAS (COMPRA/VENTA) */}
          <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex-1">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-4 tracking-[0.2em]">Execution</h3>

            <div className="space-y-3">
              <button className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg shadow-green-900/20">
                <div className="text-left">
                  <span className="block font-black text-sm uppercase">Market Long</span>
                  <span className="block text-[9px] opacity-70">Execute Order</span>
                </div>
                <TrendingUp className="w-5 h-5" />
              </button>

              <button className="w-full bg-red-600 hover:bg-red-500 text-white p-4 rounded-xl flex items-center justify-between group transition-all shadow-lg shadow-red-900/20">
                <div className="text-left">
                  <span className="block font-black text-sm uppercase">Market Short</span>
                  <span className="block text-[9px] opacity-70">Execute Order</span>
                </div>
                <TrendingDown className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/50 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500">LIQ. PRICE</span>
                <span className="text-orange-500">$52,104.00</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500">MARGIN</span>
                <span className="text-zinc-300">ISOLATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: ÁREA DEL GRÁFICO (REEMPLAZA AL CHAT) */}
        <div className="col-span-9">
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl h-full w-full relative flex flex-col items-center justify-center overflow-hidden">

            {/* INDICADOR DE STATUS */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-zinc-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-300 tracking-widest uppercase font-bold">TradingView Live Feed</span>
              </div>
            </div>

            {/* PLACEHOLDER DEL GRÁFICO */}
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Target className="w-16 h-16 text-white" />
              <div className="text-center">
                <p className="font-mono text-sm tracking-widest uppercase">Chart Canvas</p>
                <p className="text-[10px] mt-1 italic">Waiting for connection...</p>
              </div>
            </div>

            {/* GRUPO DE LÍNEAS DE FONDO (REJILLA) */}
            <div className="absolute inset-0 -z-10 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}