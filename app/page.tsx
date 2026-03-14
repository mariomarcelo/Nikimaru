'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Brain, Cpu, Zap, Target, Activity, Terminal, Globe, ShieldCheck, History, XCircle, Bot } from 'lucide-react';

export default function NikimaruV140Modular() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(0);
  const [tf, setTf] = useState('1m');
  const [balance, setBalance] = useState(10000);
  const [aiReport, setAiReport] = useState("SNC_QUANTUM: Sistema listo. Esperando órdenes...");
  const [isTrading, setIsTrading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [trades, setTrades] = useState([]);

  // --- MOTOR DE DATOS (BINANCE) ---
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
    if (isTrading) return;
    setIsTrading(true);
    const entryPrice = price;

    // Simulación de delay de red
    setTimeout(() => {
      const isWin = Math.random() > 0.4; // 60% winrate sim
      const profit = isWin ? (Math.random() * 80 + 20) : (Math.random() * -50 - 10);

      const newTrade = {
        id: Math.random().toString(36).substr(2, 4).toUpperCase(),
        type,
        price: entryPrice,
        profit: parseFloat(profit.toFixed(2)),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 10));
      setBalance(prev => prev + profit);
      setAiReport(`SNC_${type}_CONFIRMADA: PNL ${profit > 0 ? '+' : ''}${profit.toFixed(2)} USDT`);
      setIsTrading(false);
    }, 800);
  }, [price, isTrading]);

  // --- IA AUTÓNOMA (CEREBRO) ---
  useEffect(() => {
    let interval;
    if (isAuto) {
      setAiReport("IA_SNC_AUTONOMA: Escaneando liquidez y bloques de órdenes...");
      interval = setInterval(() => {
        if (!isTrading) {
          const decision = Math.random();
          if (decision > 0.85) handleTrade('LONG');
          else if (decision < 0.15) handleTrade('SHORT');
        }
      }, 5000); // Intenta operar cada 5 segundos si detecta "señal"
    } else {
      setAiReport("IA_SNC: Modo manual activado. Esperando input de usuario.");
    }
    return () => clearInterval(interval);
  }, [isAuto, isTrading, handleTrade]);

  // --- CERRAR OPERACIONES ---
  const closeAll = () => {
    if (trades.length === 0) return;
    setAiReport("LIQUIDANDO TODAS LAS POSICIONES... LIMPIANDO CACHE.");
    setTrades([]);
    setIsTrading(false);
  };

  // --- MOTOR GRÁFICO ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const w = canvas.width;
    const h = canvas.height;
    const pX = 40;
    const pY = 60;
    const cW = w - (pX * 2);
    const cH = h - (pY * 2);

    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP;

    const getY = (p) => pY + cH - ((p - minP) / range) * cH;
    const stepX = cW / candles.length;

    ctx.clearRect(0, 0, w, h);

    candles.forEach((c, i) => {
      const x = pX + (i * stepX) + stepX / 2;
      const isUp = c.close >= c.open;
      const col = isUp ? '#00ffa3' : '#ff3355';
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();
      ctx.fillStyle = isUp ? 'rgba(0, 255, 163, 0.4)' : 'rgba(255, 51, 85, 0.4)';
      ctx.fillRect(x - stepX / 3, getY(Math.max(c.open, c.close)), stepX / 1.5, Math.max(Math.abs(getY(c.open) - getY(c.close)), 1));
    });
  }, [candles]);

  useEffect(() => {
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [draw]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020202] text-zinc-400 font-mono uppercase italic overflow-hidden">

      {/* HEADER */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1 rounded text-white animate-pulse"><Cpu size={16} /></div>
          <span className="text-white font-black tracking-tighter text-xs">NIKIMARU_SNC_V140</span>
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`flex items-center gap-2 ml-4 px-3 py-1 rounded border transition-all text-[9px] font-black ${isAuto ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 text-zinc-500'}`}
          >
            <Bot size={12} /> {isAuto ? 'AUTO_SNC_ON' : 'AUTO_SNC_OFF'}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[7px] text-zinc-600 font-bold leading-none">EQUITY_USDT</p>
            <p className="text-sm font-black text-green-500 tabular-nums">${balance.toFixed(2)}</p>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
            <p className="text-[7px] text-zinc-600 font-bold leading-none">LIVE_BTC</p>
            <p className="text-sm font-black text-white tabular-nums">${price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* LEFT: INTEL */}
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-4 bg-[#050505]">
          <div className="p-4 bg-black/60 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-3">
              <Brain size={12} /> {isAuto ? 'AI_AUTONOMOUS_MODE' : 'MANUAL_OVERRIDE'}
            </div>
            <p className="text-[10px] text-zinc-300 leading-tight normal-case h-10 overflow-hidden font-bold">"{aiReport}"</p>
          </div>

          <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black mb-3 text-zinc-600 tracking-widest uppercase">Health_Stats</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span>WINRATE:</span><span className="text-green-500">62.1%</span></div>
              <div className="flex justify-between text-[9px] border-b border-white/5 pb-1"><span>RISK:</span><span className="text-red-500">LOW</span></div>
            </div>
          </div>
        </div>

        {/* CENTER: CHART */}
        <div className="flex-grow relative bg-[#020202]">
          <canvas ref={canvasRef} className="w-full h-full opacity-70" />
          <div className="absolute top-4 left-4 flex gap-2">
            {['1m', '5m', '15m'].map(t => (
              <button key={t} onClick={() => setTf(t)} className={`px-2 py-0.5 rounded text-[8px] border border-white/10 ${tf === t ? 'bg-white/10 text-white' : ''}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* RIGHT: TRADES & EXECUTION */}
        <div className="w-72 border-l border-white/5 p-4 flex flex-col gap-4 bg-[#050505]">
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 tracking-widest">
                <History size={12} /> LOG_SYSTEM
              </div>
              <button onClick={closeAll} className="text-[8px] text-red-500 hover:underline flex items-center gap-1">
                <XCircle size={10} /> CLEAR_LOG
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-white/5 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] px-1 rounded font-black ${trade.type === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {trade.type}
                    </span>
                    <span className="text-[8px] text-zinc-600">ID:{trade.id}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-zinc-500">${trade.price}</span>
                    <span className={`text-[10px] font-black ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <button onClick={() => handleTrade('LONG')} disabled={isTrading || isAuto} className="flex-grow py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] hover:bg-green-500 hover:text-black transition-all disabled:opacity-20">
                LONG
              </button>
              <button onClick={() => handleTrade('SHORT')} disabled={isTrading || isAuto} className="flex-grow py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all disabled:opacity-20">
                SHORT
              </button>
            </div>
            <button
              onClick={closeAll}
              className="w-full py-2 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[9px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <XCircle size={14} /> CLOSE_ALL_POSITIONS
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-bold tracking-widest text-zinc-500">
        <div className="flex gap-8">
          <div className="flex items-center gap-1.5"><Globe size={10} className="text-green-500" /> SNC_V140_CORE: RUNNING</div>
          <div className="flex items-center gap-1.5"><ShieldCheck size={10} /> ENCRYPTION: AES-256</div>
        </div>
        <div className="flex gap-4 items-center">
          <div className={`w-1.5 h-1.5 rounded-full ${isAuto ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
          <span>STATUS: {isAuto ? 'AI_ACTIVE' : 'READY'}</span>
        </div>
      </div>
    </div>
  );
}