'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Brain, Zap, Target, Activity, Shield, Cpu, Maximize2, MousePointer2 } from 'lucide-react';

export default function NikimaruV50Tactical() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [trade, setTrade] = useState(null);
  const [aiLog, setAiLog] = useState("SNC_V50: ANALIZANDO FLUJO INSTITUCIONAL...");

  // --- 1. CONEXIÓN REAL TIME ---
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`);
    ws.onmessage = (e) => setMarketData({ price: parseFloat(JSON.parse(e.data).k.c) });

    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=120`);
      const d = await res.json();
      setCandles(d.map(c => ({
        open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
      })));
    };
    fetchHistory();
    return () => ws.close();
  }, []);

  // --- 2. MOTOR GRÁFICO TÁCTICO ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const w = canvas.width;
    const h = canvas.height;
    const maxP = Math.max(...candles.map(c => c.high)) * 1.0002;
    const minP = Math.min(...candles.map(c => c.low)) * 0.9998;
    const range = maxP - minP;
    const getY = (p) => h - ((p - minP) / range) * h;
    const cW = w / candles.length;

    // Fondo y Grid
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < w; i += cW * 5) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Velas Japonesas
    candles.forEach((c, i) => {
      const x = i * cW + cW / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? '#00ffaa' : '#ff3355';

      // Mecha
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();

      // Cuerpo con Glow sutil
      ctx.shadowBlur = 5;
      ctx.shadowColor = color;
      ctx.fillStyle = isUp ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 51, 85, 0.3)';
      ctx.strokeStyle = color;
      const bT = getY(Math.max(c.open, c.close));
      const bB = getY(Math.min(c.open, c.close));
      ctx.fillRect(x - cW / 3, bT, cW / 1.5, bB - bT);
      ctx.strokeRect(x - cW / 3, bT, cW / 1.5, bB - bT);
      ctx.shadowBlur = 0;
    });

    // Línea de Precio Actual
    const curY = getY(marketData.price);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.moveTo(0, curY); ctx.lineTo(w, curY); ctx.stroke();
    ctx.setLineDash([]);
  }, [candles, marketData]);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-mono text-xs uppercase tracking-tighter">
      {/* CANVAS DEL GRÁFICO (FONDO TOTAL) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* TOP HUD: STATUS BAR */}
      <div className="absolute top-0 left-0 w-full h-10 flex items-center justify-between px-6 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-500 font-black">
            <Cpu size={14} /> NIKIMARU_V50_SNC
          </div>
          <div className="text-zinc-500 border-l border-white/10 pl-4">BTC/USDT <span className="text-white">${marketData.price}</span></div>
        </div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1 text-[9px] text-green-500"><Activity size={12} /> SERVERS_ONLINE</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
        </div>
      </div>

      {/* WIDGET FLOTANTE 1: IA ANALYSIS (IZQUIERDA) */}
      <div className="absolute top-20 left-10 w-64 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-30 transform hover:scale-105 transition-transform">
        <div className="flex items-center gap-2 text-blue-400 mb-3 font-black text-[10px]">
          <Brain size={16} /> NEURAL_DECISION_ENGINE
        </div>
        <div className="space-y-3">
          <p className="text-[10px] text-zinc-300 italic leading-relaxed">"{aiLog}"</p>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-2/3 animate-pulse" />
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-zinc-500">BIAS:</span>
            <span className="text-blue-400 font-bold underline">BULLISH_REJECTION</span>
          </div>
        </div>
      </div>

      {/* WIDGET FLOTANTE 2: EXECUTION PANEL (DERECHA) */}
      <div className="absolute top-20 right-10 w-64 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-30">
        <div className="text-[9px] font-black text-zinc-500 mb-4 tracking-[0.2em]">ORDEN_SNIPER</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="py-3 bg-green-500/10 border border-green-500/50 text-green-500 font-black hover:bg-green-500 hover:text-black transition-all rounded-lg">BUY</button>
          <button className="py-3 bg-red-500/10 border border-red-500/50 text-red-500 font-black hover:bg-red-500 hover:text-black transition-all rounded-lg">SELL</button>
        </div>
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex justify-between text-[9px]"><span>RISK:</span> <span className="text-white">1.00%</span></div>
          <div className="flex justify-between text-[9px]"><span>LEVERAGE:</span> <span className="text-white">20X</span></div>
        </div>
      </div>

      {/* WIDGET FLOTANTE 3: ORDER FLOW (CENTRO ABAJO) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-8 z-30 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-500">RSI(14)</span>
          <span className="text-purple-400 font-bold">54.2</span>
        </div>
        <div className="w-[1px] h-6 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-500">VOL_INST</span>
          <span className="text-green-500 font-bold">HIGH</span>
        </div>
        <div className="w-[1px] h-6 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-zinc-500">SNC_SIGNAL</span>
          <span className="text-white font-bold animate-pulse">WAITING...</span>
        </div>
      </div>

      {/* MARCA DE AGUA ESTILO TRADINGVIEW */}
      <div className="absolute bottom-10 right-10 text-[60px] font-black text-white/[0.02] pointer-events-none select-none uppercase">
        Nikimaru SNC
      </div>
    </div>
  );
}