'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Brain, Cpu, Zap, Target, Activity, Terminal, Globe, ShieldCheck, History, XCircle, Bot, Settings2, Wallet } from 'lucide-react';

export default function NikimaruV140Modular() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(0);
  const [tf, setTf] = useState('1m');

  // --- GESTIÓN DE CAPITAL ---
  const [initialCapital, setInitialCapital] = useState(10000); // Dinero inicial configurable
  const [balance, setBalance] = useState(10000);

  const [aiReport, setAiReport] = useState("SNC_SYSTEM: Online. Defina su capital inicial.");
  const [isTrading, setIsTrading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [trades, setTrades] = useState([]);

  // CONFIGURACIÓN DE RIESGO
  const [leverage, setLeverage] = useState(20);
  const [tradeAmount, setTradeAmount] = useState(100);

  // Actualizar balance cuando el usuario cambia el capital inicial (si no hay trades activos)
  const handleInitialCapitalChange = (val) => {
    const num = parseFloat(val) || 0;
    setInitialCapital(num);
    if (trades.length === 0) {
      setBalance(num);
    }
  };

  // --- MOTOR DE DATOS ---
  useEffect(() => {
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${tf}&limit=80`)
      .then(res => res.json())
      .then(data => {
        setCandles(data.map(c => ({
          time: c[0], open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
        })));
      });

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${tf}`);
    ws.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      setPrice(parseFloat(k.c));
      if (k.x) {
        setCandles(prev => [...prev.slice(1), { time: k.t, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c) }]);
      }
    };
    return () => ws.close();
  }, [tf]);

  // --- LÓGICA DE EJECUCIÓN ---
  const handleTrade = useCallback((type) => {
    if (isTrading || tradeAmount > balance) {
      setAiReport("SNC_ERROR: Fondos insuficientes o sistema ocupado.");
      return;
    }
    setIsTrading(true);
    const entryPrice = price;

    setTimeout(() => {
      const isWin = Math.random() > 0.48;
      const marketMove = (Math.random() * 0.0035);
      const rawProfit = isWin ? (tradeAmount * leverage * marketMove) : (tradeAmount * leverage * marketMove * -1.2);
      const finalProfit = parseFloat(rawProfit.toFixed(2));

      const newTrade = {
        id: Math.random().toString(36).substr(2, 4).toUpperCase(),
        type,
        price: entryPrice,
        lev: leverage,
        margin: tradeAmount,
        profit: finalProfit,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 10));
      setBalance(prev => prev + finalProfit);
      setAiReport(`SNC_${type}_EJECUTADO: ${finalProfit > 0 ? 'PROFIT' : 'LOSS'} ${finalProfit} USDT`);
      setIsTrading(false);
    }, 500);
  }, [price, isTrading, leverage, tradeAmount, balance]);

  // IA AUTÓNOMA
  useEffect(() => {
    let interval;
    if (isAuto) {
      interval = setInterval(() => {
        if (!isTrading) {
          const decision = Math.random();
          if (decision > 0.93) handleTrade('LONG');
          else if (decision < 0.07) handleTrade('SHORT');
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAuto, isTrading, handleTrade]);

  // --- MOTOR GRÁFICO ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const w = canvas.width;
    const h = canvas.height;
    const pX = 60;
    const pY = 40;
    const cW = w - pX;
    const cH = h - (pY * 2);

    const maxP = Math.max(...candles.map(c => c.high)) * 1.0001;
    const minP = Math.min(...candles.map(c => c.low)) * 0.9999;
    const range = (maxP - minP) || 1;

    const getY = (p) => pY + cH - ((p - minP) / range) * cH;
    const stepX = cW / candles.length;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i <= 5; i++) {
      const y = pY + (cH / 5) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cW, y); ctx.stroke();
      ctx.fillStyle = '#333';
      ctx.font = '7px monospace';
      ctx.fillText((maxP - (range / 5) * i).toFixed(1), cW + 5, y + 3);
    }

    // Velas
    candles.forEach((c, i) => {
      const x = (i * stepX) + stepX / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? '#00ffa3' : '#ff3355';
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();
      ctx.fillStyle = isUp ? 'rgba(0, 255, 163, 0.4)' : 'rgba(255, 51, 85, 0.4)';
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyHeight = Math.max(Math.abs(getY(c.open) - getY(c.close)), 1);
      ctx.fillRect(x - stepX / 3, bodyTop, (stepX / 3) * 2, bodyHeight);
    });

    // Línea de Precio
    const currentY = getY(price);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(0, currentY); ctx.lineTo(cW, currentY); ctx.stroke();
    ctx.setLineDash([]);
  }, [candles, price]);

  useEffect(() => {
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [draw]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020202] text-zinc-400 font-mono uppercase italic overflow-hidden">

      {/* HEADER */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1 rounded text-white animate-pulse"><Cpu size={16} /></div>
          <span className="text-white font-black tracking-tighter text-xs">NIKIMARU_SNC_V140</span>
          <button onClick={() => setIsAuto(!isAuto)} className={`flex items-center gap-2 ml-4 px-3 py-1 rounded border transition-all text-[9px] font-black ${isAuto ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
            <Bot size={12} /> {isAuto ? 'AUTO_SNC_ON' : 'AUTO_SNC_OFF'}
          </button>
        </div>
        <div className="flex gap-8 items-center">
          <div className="text-right">
            <p className="text-[7px] text-zinc-600 font-bold">TOTAL_EQUITY</p>
            <p className="text-sm font-black text-green-500 tabular-nums">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right border-l border-white/10 pl-6 text-white font-black">
            <p className="text-[7px] text-zinc-600 font-bold">LIVE_BTC</p>
            <p className="text-sm tabular-nums">${price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* PANEL IZQUIERDO: CONFIG & WALLET */}
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-4 bg-[#050505] z-20">
          <div className="p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-green-500 text-[9px] font-black mb-4">
              <Wallet size={12} /> WALLET_CONFIG
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[8px] text-zinc-500 block mb-1">INITIAL_CAPITAL (USDT)</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => handleInitialCapitalChange(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-green-600 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-4">
              <Settings2 size={12} /> RISK_PARAM
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[8px] text-zinc-500 block mb-1">LEVERAGE: {leverage}X</label>
                <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-red-600 cursor-pointer" />
              </div>
              <div>
                <label className="text-[8px] text-zinc-500 block mb-1">MARGIN PER TRADE</label>
                <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseInt(e.target.value))} className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTRO: CHART */}
        <div ref={containerRef} className="flex-grow relative bg-[#020202] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* PANEL DERECHO: LOG & ACTION */}
        <div className="w-72 border-l border-white/5 p-4 flex flex-col gap-4 bg-[#050505] z-20">
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 mb-4 tracking-widest uppercase">
              <History size={12} /> Transaction_History
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-white/5 p-2 rounded border border-white/5">
                  <div className="flex justify-between items-center text-[8px] mb-1 font-bold">
                    <span className={trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}>{trade.type} {trade.lev}X</span>
                    <span className="text-zinc-600">${trade.margin}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-zinc-500">${trade.price.toFixed(1)}</span>
                    <span className={`text-[10px] font-black ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => handleTrade('LONG')} disabled={isTrading || isAuto} className="flex-grow py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] hover:bg-green-500 hover:text-black disabled:opacity-10 transition-all">LONG</button>
              <button onClick={() => handleTrade('SHORT')} disabled={isTrading || isAuto} className="flex-grow py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white disabled:opacity-10 transition-all">SHORT</button>
            </div>
            <button
              onClick={() => { setTrades([]); setBalance(initialCapital); setAiReport("SNC_RESET: Sesión reiniciada."); }}
              className="w-full py-2 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[9px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <XCircle size={12} /> RESET_TO_INITIAL
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-bold tracking-widest text-zinc-600">
        <div className="flex gap-8">
          <div className="flex items-center gap-1.5"><Globe size={10} className="text-green-500" /> SNC_SIM_CORE: ACTIVE</div>
          <div className="flex items-center gap-1.5 font-black text-red-500 italic uppercase leading-none">"{aiReport}"</div>
        </div>
        <span>SESSION: STABLE</span>
      </div>
    </div>
  );
}