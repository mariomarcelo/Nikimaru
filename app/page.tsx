'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X } from 'lucide-react';

export default function NikimaruBinanceStable() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');

  // Función para abrir orden
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const newPos = {
      id: Date.now(),
      symbol: 'BTCUSDT',
      type: type,
      leverage: leverage,
      entry: selectedPrice,
    };
    setPositions([newPos, ...positions]);
  };

  useEffect(() => {
    // CARGAR GRÁFICO UNA SOLA VEZ
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "BINANCE:BTCUSDT",
      "interval": "1",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "allow_symbol_change": true,
      "container_id": "tv_chart_stable"
    });

    if (container.current && container.current.children.length === 0) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* MODAL APALANCAMIENTO */}
      {showLeverageModal && (
        <div className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center">
          <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] w-80 shadow-2xl">
            <div className="flex justify-between mb-4 font-bold text-white">
              <span>Ajustar Apalancamiento</span>
              <button onClick={() => setShowLeverageModal(false)}><X /></button>
            </div>
            <input
              type="range" min="1" max="125" value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full accent-[#f0b90b] mb-4"
            />
            <div className="text-center text-4xl font-black text-[#f0b90b] mb-6">{leverage}x</div>
            <button onClick={() => setShowLeverageModal(false)} className="w-full bg-[#f0b90b] text-black font-bold py-3 rounded-lg hover:bg-[#d9a508]">
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between">
        <div className="flex items-center gap-2 text-[#f0b90b] font-bold uppercase tracking-tighter">
          <Zap className="w-5 h-5 fill-[#f0b90b]" />
          <span className="text-lg">Nikimaru <span className="text-white font-light">Terminal</span></span>
        </div>
        <div className="text-xs font-mono text-zinc-500">BTCUSDT Perpetual</div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* IZQUIERDA: ORDER BOOK (ESTÁTICO PARA EVITAR PARPADEO) */}
        <div className="w-[200px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] text-[10px] font-mono">
          <div className="p-2 text-zinc-500 border-b border-[#2b2f36] flex justify-between uppercase text-[9px]">
            <span>Price</span>
            <span>Amount</span>
          </div>
          <div className="flex-1 flex flex-col justify-end text-[#f84960] opacity-80">
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68310.5')}><span>68310.5</span><span>0.412</span></div>
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68305.2')}><span>68305.2</span><span>1.105</span></div>
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68300.0')}><span>68300.0</span><span>0.052</span></div>
          </div>
          <div className="p-3 text-xl font-bold text-[#02c076] bg-[#1e2329] border-y border-[#2b2f36] text-center">
            68,250.40
          </div>
          <div className="flex-1 text-[#02c076] opacity-80">
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68245.8')}><span>68245.8</span><span>0.890</span></div>
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68240.1')}><span>68240.1</span><span>2.441</span></div>
            <div className="flex justify-between px-2 cursor-pointer py-[1px]" onClick={() => setSelectedPrice('68235.5')}><span>68235.5</span><span>0.120</span></div>
          </div>
        </div>

        {/* CENTRO: GRÁFICO (SIN LÓGICA DE RECARGA) */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
          <div className="flex-1 relative">
            <div id="tv_chart_stable" ref={container} className="w-full h-full" />
          </div>

          {/* PANEL DE POSICIONES */}
          <div className="h-44 border-t border-[#2b2f36] bg-[#161a1e] overflow-y-auto">
            <div className="p-2 border-b border-[#2b2f36] text-[10px] font-bold text-zinc-500 uppercase">Posiciones Abiertas ({positions.length})</div>
            <table className="w-full text-[11px] text-left">
              <thead className="text-zinc-500 border-b border-[#2b2f36]">
                <tr>
                  <th className="p-2 font-normal">Símbolo</th>
                  <th className="p-2 font-normal">Tipo</th>
                  <th className="p-2 font-normal">Precio Entrada</th>
                  <th className="p-2 font-normal">Acción</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-[#2b2f36] hover:bg-zinc-800/30">
                    <td className="p-2 font-bold">{pos.symbol} <span className="text-[#f0b90b] text-[9px]">{pos.leverage}x</span></td>
                    <td className={`p-2 font-bold ${pos.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>{pos.type}</td>
                    <td className="p-2 font-mono text-zinc-300">{pos.entry}</td>
                    <td className="p-2">
                      <button
                        onClick={() => setPositions(positions.filter(p => p.id !== pos.id))}
                        className="text-zinc-500 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA: PANEL OPERATIVO */}
        <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4">
          <button
            onClick={() => setShowLeverageModal(true)}
            className="w-full bg-[#2b3139] py-2 rounded text-xs text-[#f0b90b] border border-[#f0b90b]/30 font-bold hover:bg-[#3b4149] transition-colors"
          >
            Aislado {leverage}x
          </button>

          <div className="space-y-4 pt-2">
            <div className="bg-[#2b3139] rounded p-3 flex justify-between items-center border border-transparent focus-within:border-[#f0b90b]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Precio</span>
              <input
                type="text"
                className="bg-transparent text-right text-sm outline-none font-mono w-24"
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              />
              <span className="text-[10px] text-zinc-500">USDT</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleTrade('LONG')}
                className="w-full bg-[#02c076] hover:bg-[#03d382] py-3.5 rounded font-black text-xs uppercase shadow-lg shadow-green-900/10 active:scale-95 transition-all"
              >
                Comprar / Long
              </button>
              <button
                onClick={() => handleTrade('SHORT')}
                className="w-full bg-[#f84960] hover:bg-[#ff5d72] py-3.5 rounded font-black text-xs uppercase shadow-lg shadow-red-900/10 active:scale-95 transition-all"
              >
                Vender / Short
              </button>
            </div>
          </div>

          <div className="mt-auto border-t border-[#2b2f36] pt-4 text-[10px] space-y-2 font-mono text-zinc-500">
            <div className="flex justify-between"><span>Disponible</span><span className="text-white">1,540.20 USDT</span></div>
            <div className="flex justify-between"><span>Costo</span><span>0.00 USDT</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}