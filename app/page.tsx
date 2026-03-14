'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Brain, Cpu, Zap, Target, Activity, Terminal, Globe, ShieldCheck, History, XCircle, Bot, Settings2, Wallet, Clock } from 'lucide-react';

export default function NikimaruV140Modular() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(0);
  const [tf, setTf] = useState('1m');

  // --- GESTIÓN DE CAPITAL Y ESTADOS ---
  const [initialCapital, setInitialCapital] = useState(10000);
  const [balance, setBalance] = useState(10000);
  const [aiReport, setAiReport] = useState("SNC_SYSTEM: Online. Conectado a BingX VST.");
  const [isTrading, setIsTrading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [trades, setTrades] = useState([]);

  // CONFIGURACIÓN DE RIESGO Y TIEMPO
  const [leverage, setLeverage] = useState(20);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeDuration, setTradeDuration] = useState(60);

  // --- MOTOR DE DATOS (BINANCE PARA EL GRÁFICO) ---
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

  // --- LÓGICA DE CIERRE POR TIEMPO (CONTADOR) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTrades(prevTrades => {
        return prevTrades.map(trade => {
          if (trade.status === 'OPEN' && trade.timeLeft > 0) {
            return { ...trade, timeLeft: trade.timeLeft - 1 };
          }
          if (trade.status === 'OPEN' && trade.timeLeft <= 0) {
            // Simulamos el cierre en el balance (BingX lo hace real en su plataforma)
            const isWin = Math.random() > 0.48;
            const pnl = isWin ? (trade.margin * trade.lev * 0.002) : (trade.margin * trade.lev * -0.0025);
            setBalance(b => b + pnl);
            return { ...trade, status: 'CLOSED', profit: parseFloat(pnl.toFixed(2)) };
          }
          return trade;
        });
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- EJECUCIÓN REAL BINGX (MANUAL Y IA) ---
  const handleTrade = useCallback(async (direction) => {
    if (isTrading || tradeAmount > balance) {
      setAiReport("SNC_ERROR: Fondos insuficientes o ejecución en curso.");
      return;
    }

    setIsTrading(true);
    setAiReport(`ENVIANDO ${direction === 'BUY' ? 'LONG' : 'SHORT'} A BINGX VST...`);

    try {
      const response = await fetch('/api/bingx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: "BTC-USDT",
          side: direction,
          margin: tradeAmount,
          leverage: leverage
        })
      });

      const result = await response.json();

      if (result.code === 0) {
        const newTrade = {
          id: result.data.orderId || Math.random().toString(36).substr(2, 4).toUpperCase(),
          type: direction === 'BUY' ? 'LONG' : 'SHORT',
          price: price,
          lev: leverage,
          margin: tradeAmount,
          profit: 0,
          timeLeft: tradeDuration,
          status: 'OPEN',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 10));
        setAiReport(`BINGX_SUCCESS: ID ${result.data.orderId}`);
      } else {
        setAiReport(`BINGX_API_ERROR: ${result.msg}`);
      }
    } catch (error) {
      setAiReport("SNC_NETWORK_ERROR: Fallo en Vercel Edge");
    } finally {
      setIsTrading(false);
    }
  }, [price, tradeAmount, leverage, balance, isTrading, tradeDuration]);

  // --- IA AUTÓNOMA CONECTADA A BINGX ---
  useEffect(() => {
    let interval;
    if (isAuto) {
      setAiReport("IA_SNC_AUTONOMA: Escaneando señales para BingX...");
      interval = setInterval(() => {
        if (!isTrading) {
          const decision = Math.random();
          if (decision > 0.96) handleTrade('BUY');
          else if (decision < 0.04) handleTrade('SELL');
        }
      }, 4000);
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
    const w = canvas.width; const h = canvas.height;
    const pX = 60; const pY = 40;
    const cW = w - pX; const cH = h - (pY * 2);
    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = (maxP - minP) || 1;
    const getY = (p) => pY + cH - ((p - minP) / range) * cH;
    const stepX = cW / candles.length;

    ctx.clearRect(0, 0, w, h);
    candles.forEach((c, i) => {
      const x = (i * stepX) + stepX / 2;
      const isUp = c.close >= c.open;
      ctx.strokeStyle = isUp ? '#00ffa3' : '#ff3355';
      ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();
      ctx.fillStyle = isUp ? 'rgba(0, 255, 163, 0.4)' : 'rgba(255, 51, 85, 0.4)';
      ctx.fillRect(x - stepX / 3, getY(Math.max(c.open, c.close)), (stepX / 3) * 2, Math.max(Math.abs(getY(c.open) - getY(c.close)), 1));
    });
  }, [candles]);

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
            <Bot size={12} /> {isAuto ? 'IA_BINGX_ON' : 'IA_OFF'}
          </button>
        </div>
        <div className="flex gap-8 items-center">
          <div className="text-right">
            <p className="text-[7px] text-zinc-600 font-bold">TOTAL_EQUITY</p>
            <p className="text-sm font-black text-green-500 tabular-nums">${balance.toLocaleString()}</p>
          </div>
          <div className="text-right border-l border-white/10 pl-6 text-white font-black">
            <p className="text-[7px] text-zinc-600 font-bold">BTC_PRICE</p>
            <p className="text-sm tabular-nums">${price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* PANEL IZQUIERDO: CONFIG */}
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-4 bg-[#050505] z-20">
          <div className="p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-blue-500 text-[9px] font-black mb-4">
              <Clock size={12} /> EXPIRATION
            </div>
            <select
              value={tradeDuration}
              onChange={(e) => setTradeDuration(parseInt(e.target.value))}
              className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-blue-600"
            >
              <option value={30}>30 SECONDS</option>
              <option value={60}>1 MINUTE</option>
              <option value={300}>5 MINUTES</option>
            </select>
          </div>

          <div className="p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-4">
              <Settings2 size={12} /> RISK_PARAM
            </div>
            <div className="space-y-4">
              <label className="text-[8px] text-zinc-500">LEVERAGE: {leverage}X</label>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full accent-red-600" />
              <label className="text-[8px] text-zinc-500 block mt-2">MARGIN (USDT)</label>
              <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseInt(e.target.value))} className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-white outline-none" />
            </div>
          </div>
        </div>

        {/* CENTRO: CHART */}
        <div ref={containerRef} className="flex-grow relative bg-[#020202] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* PANEL DERECHO: TRADES */}
        <div className="w-72 border-l border-white/5 p-4 flex flex-col gap-4 bg-[#050505] z-20">
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 mb-4 tracking-widest uppercase">
              <History size={12} /> BingX_VST_History
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {trades.map((trade) => (
                <div key={trade.id} className={`bg-white/5 p-2 rounded border ${trade.status === 'OPEN' ? 'border-blue-500/30' : 'border-white/5 opacity-50'}`}>
                  <div className="flex justify-between items-center text-[8px] mb-1 font-bold">
                    <span className={trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}>{trade.type} {trade.lev}X</span>
                    {trade.status === 'OPEN' ? (
                      <span className="text-blue-500 animate-pulse">{trade.timeLeft}s</span>
                    ) : (
                      <span className="text-zinc-600">CLOSED</span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] text-zinc-500">ID: {trade.id}</span>
                    <span className={`text-[10px] font-black ${trade.status === 'OPEN' ? 'text-white' : (trade.profit >= 0 ? 'text-green-500' : 'text-red-500')}`}>
                      {trade.status === 'OPEN' ? 'OPEN' : `${trade.profit >= 0 ? '+' : ''}${trade.profit}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => handleTrade('BUY')} disabled={isTrading} className="flex-grow py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] hover:bg-green-500 hover:text-black transition-all">EXECUTE_LONG</button>
              <button onClick={() => handleTrade('SELL')} disabled={isTrading} className="flex-grow py-3 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all">EXECUTE_SHORT</button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-10 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-bold tracking-widest text-zinc-600">
        <div className="flex gap-8">
          <div className="flex items-center gap-1.5 font-black text-blue-500 uppercase leading-none italic animate-pulse">"{aiReport}"</div>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <Globe size={10} /> NETWORK: BINGX_VST_ACTIVE
        </div>
      </div>
    </div>
  );
}