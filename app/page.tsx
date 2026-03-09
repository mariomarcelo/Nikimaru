'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, Bot, Maximize2, Minimize2, Target, ShieldAlert, TrendingUp, Gauge, DollarSign } from 'lucide-react';

export default function NikimaruFullControlTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // NUEVO: ESTADO DE MONTO (USDT)
  const [amount, setAmount] = useState('100');

  // ESTADO DE APALANCAMIENTO
  const [leverage, setLeverage] = useState(20);

  // ESTADOS DE TRADING
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [useTrigger, setUseTrigger] = useState(false);

  // LIBRO DE ÓRDENES
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // MOTOR DE PRECIO
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 8;
      setLivePrice(p);
      const genRows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 0.5 : b - i * 0.5).toFixed(1),
        q: (Math.random() * 2).toFixed(3),
        v: Math.random() * 100
      }));
      setOrderBook({ asks: genRows(p, 'ask'), bids: genRows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // FUNCIÓN DE TRADING (Ahora toma el monto del input)
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = useTrigger ? parseFloat(triggerPrice) : parseFloat(selectedPrice);
    const tradeAmount = parseFloat(amount);

    if (isNaN(entry) || isNaN(tradeAmount) || tradeAmount <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    const newPos = {
      id: Date.now(),
      type,
      entry: entry,
      leverage: leverage,
      amount: tradeAmount, // <--- Monto real ingresado por vos
      tp: tpPrice,
      sl: slPrice
    };

    setPositions([newPos, ...positions]);
    setTpPrice(''); setSlPrice(''); setTriggerPrice(''); setUseTrigger(false);
  };

  const closePartial = (id: number, pct: number) => {
    if (pct === 100) setPositions(prev => prev.filter(p => p.id !== id));
    else setPositions(prev => prev.map(p => p.id === id ? { ...p, amount: p.amount * (1 - pct / 100) } : p));
  };

  // GRÁFICO
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({ "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart" });
      container.current.appendChild(script);
    }
  }, [isFullScreen]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <div className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase italic tracking-tighter">
            <Zap size={18} fill="#f0b90b" />
            <span>Nikimaru <span className="text-white font-thin">Futures</span></span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">MODO ANÁLISIS</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* IZQUIERDA: ORDER BOOK */}
        {!isFullScreen && (
          <div className="w-[180px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] z-20">
            <div className="flex-1 flex flex-col justify-end">
              {orderBook.asks.map((a, i) => (<div key={i} onClick={() => setSelectedPrice(a.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-red-500/10 text-[#f84960]"><span>{a.p}</span><span>{a.q}</span></div>))}
            </div>
            <div className="p-2 text-md font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (<div key={i} onClick={() => setSelectedPrice(b.p)} className="flex justify-between px-2 py-[1px] cursor-pointer hover:bg-green-500/10 text-[#02c076]"><span>{b.p}</span><span>{b.q}</span></div>))}
            </div>
          </div>
        )}

        {/* CENTRO: CHART + POSICIONES */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart" ref={container} className="flex-1 w-full" />
          {!isFullScreen && (
            <div className="h-40 border-t border-[#2b2f36] bg-[#161a1e] p-2 overflow-y-auto">
              <div className="text-[9px] font-bold text-zinc-500 uppercase mb-2">Posiciones Activas</div>
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/30 p-2 rounded-xl mb-1 border-l-2 border-[#f0b90b]">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-[#02c076]' : 'text-[#f84960]'}`}>
                      {p.type} {p.leverage}x | <span className="text-white">${p.amount.toFixed(2)} USDT</span>
                    </span>
                    <span className="text-[9px] text-zinc-500">Entrada: {p.entry} | TP: {p.tp || '-'}</span>
                  </div>
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => closePartial(p.id, pct)} className="bg-[#2b3139] hover:bg-[#f0b90b] hover:text-black text-[9px] px-2 py-1 rounded font-bold transition-all">
                        {pct === 100 ? 'Cerrar' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA: PANEL DE CONTROL */}
        {!isFullScreen && (
          <div className="w-[280px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-3 z-40 overflow-y-auto">

            {/* INPUT DE MONTO (DINERO) */}
            <div className="bg-[#2b3139] p-3 rounded-2xl border border-zinc-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><DollarSign size={12} /> Monto Orden</span>
                <span className="text-zinc-500 text-[9px] font-bold uppercase">USDT</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-right text-2xl font-mono text-white outline-none tracking-tighter"
                placeholder="0.00"
              />
            </div>

            {/* SELECTOR DE APALANCAMIENTO */}
            <div className="bg-black/20 p-3 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Gauge size={12} /> Apalancamiento</span>
                <span className="text-[#f0b90b] text-sm font-black bg-[#f0b90b]/10 px-2 py-0.5 rounded border border-[#f0b90b]/20 tracking-tighter">{leverage}x</span>
              </div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#f0b90b]" />
            </div>

            {/* GATILLO, TP, SL */}
            <div className={`p-3 rounded-2xl border ${useTrigger ? 'border-[#f0b90b] bg-[#f0b90b]/5' : 'border-zinc-800 bg-black/20'}`}>
              <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1"><Target size={12} /> Trigger</span><input type="checkbox" checked={useTrigger} onChange={(e) => setUseTrigger(e.target.checked)} className="accent-[#f0b90b]" /></div>
              <input disabled={!useTrigger} placeholder="Precio Disparo" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none text-[#f0b90b]" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800"><span className="text-[8px] font-bold text-[#02c076] uppercase block mb-1 tracking-widest">Take Profit</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} /></div>
              <div className="bg-black/20 p-2 rounded-2xl border border-zinc-800"><span className="text-[8px] font-bold text-[#f84960] uppercase block mb-1 tracking-widest">Stop Loss</span><input placeholder="Precio" className="w-full bg-[#2b3139] p-2 rounded-lg text-right text-xs font-mono outline-none" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} /></div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[9px] text-zinc-500 font-black uppercase block mb-1 tracking-widest">Precio Mercado</label>
              <input className="w-full bg-transparent text-right text-2xl font-mono text-[#f0b90b] outline-none tracking-tighter" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-green-900/20">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-red-900/20">Sell / Short</button>
            </div>
          </div>
        )}

        {/* NIKIMARU BOT ICON */}
        <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
          <div className="pointer-events-auto p-4 bg-[#f0b90b] rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer">
            <Bot size={28} className="text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}