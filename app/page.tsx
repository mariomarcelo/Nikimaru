'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Brain, Cpu, Activity, Zap, Shield, ChevronRight } from 'lucide-react';

export default function NikimaruV60Centered() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [aiInsight, setAiInsight] = useState("SNC_CORE: Analizando expansión de rango...");

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`);
    ws.onmessage = (e) => setMarketData({ price: parseFloat(JSON.parse(e.data).k.c) });

    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100`);
      const d = await res.json();
      setCandles(d.map(c => ({
        open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
      })));
    };
    fetchHistory();
    return () => ws.close();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');

    // Ajuste de resolución para evitar desenfoque
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = window.innerWidth;
    const h = window.innerHeight;

    // --- CONFIGURACIÓN DE CENTRADO (PADDING) ---
    const horizontalPadding = w * 0.15; // 15% de espacio a los lados
    const verticalPadding = h * 0.20;   // 20% de espacio arriba y abajo
    const chartWidth = w - (horizontalPadding * 2);
    const chartHeight = h - (verticalPadding * 2);

    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP;

    const getY = (p) => verticalPadding + chartHeight - ((p - minP) / range) * chartHeight;
    const candleWidth = chartWidth / candles.length;

    // Limpieza de frame
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    // Dibujo de Grid Sutil (Solo en el área central)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = verticalPadding + (chartHeight / 10) * i;
      ctx.beginPath(); ctx.moveTo(horizontalPadding, y); ctx.lineTo(w - horizontalPadding, y); ctx.stroke();
    }

    // Renderizado de Velas
    candles.forEach((c, i) => {
      const x = horizontalPadding + (i * candleWidth) + candleWidth / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#00ffa3' : '#ff3355';

      // Mecha Sniper
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Cuerpo (Estética de tu imagen: Sin relleno sólido, solo borde y glow)
      ctx.strokeStyle = color;
      ctx.fillStyle = isBull ? 'rgba(0, 255, 163, 0.15)' : 'rgba(255, 51, 85, 0.15)';
      const top = getY(Math.max(c.open, c.close));
      const bottom = getY(Math.min(c.open, c.close));
      const bodyH = Math.max(bottom - top, 1);

      ctx.fillRect(x - (candleWidth / 3), top, (candleWidth / 1.5), bodyH);
      ctx.strokeRect(x - (candleWidth / 3), top, (candleWidth / 1.5), bodyH);
    });

    // Línea de Precio Actual (Efecto Escáner)
    const currentY = getY(marketData.price);
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath(); ctx.moveTo(0, currentY); ctx.lineTo(w, currentY); ctx.stroke();
    ctx.setLineDash([]);

  }, [candles, marketData]);

  return (
    <div className="h-screen w-screen bg-[#020202] text-[#e0e0e0] font-mono overflow-hidden select-none italic">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }} />

      {/* TOP HEADER - ULTRA MINIMAL */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-12 z-20 px-8 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/5">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-red-600" />
          <span className="text-[10px] font-black tracking-widest uppercase">Nikimaru_SNC_Quantum</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-[10px]">BTC/USDT</span>
          <span className="text-white font-black text-sm tabular-nums">${marketData.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] text-zinc-500 uppercase">Live_Flow</span>
        </div>
      </div>

      {/* IA FLOATING CARD - IZQUIERDA */}
      <div className="absolute top-24 left-10 w-60 p-5 bg-black/40 backdrop-blur-2xl border border-red-950/30 rounded-[2rem] z-30 shadow-2xl">
        <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-3 uppercase tracking-widest">
          <Brain size={14} /> Neural_Analysis
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 leading-tight">
          "{aiInsight}"
        </p>
        <div className="space-y-2 opacity-60">
          <div className="flex justify-between text-[8px]"><span>LIQUIDITY:</span> <span className="text-white">CAPTURED</span></div>
          <div className="flex justify-between text-[8px]"><span>BIAS:</span> <span className="text-green-500">BULLISH</span></div>
        </div>
      </div>

      {/* ACTION CARD - DERECHA */}
      <div className="absolute top-24 right-10 w-60 p-5 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] z-30">
        <div className="text-[9px] text-zinc-500 mb-4 font-black tracking-widest uppercase text-center">Protocolo_Ejecución</div>
        <div className="grid gap-2">
          <button className="py-4 bg-white/5 hover:bg-green-600/20 border border-white/10 hover:border-green-500 text-zinc-400 hover:text-green-500 transition-all rounded-2xl text-[10px] font-black uppercase tracking-tighter">Instant_Long</button>
          <button className="py-4 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500 text-zinc-400 hover:text-red-500 transition-all rounded-2xl text-[10px] font-black uppercase tracking-tighter">Instant_Short</button>
        </div>
      </div>

      {/* BOTTOM NAV - METRICS */}
      <div className="absolute bottom-10 left-10 flex gap-4 z-20">
        <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
          <p className="text-[8px] text-zinc-600 font-black uppercase mb-1 tracking-widest">Volatilidad</p>
          <p className="text-xs font-bold text-white">0.84% <span className="text-green-500">↑</span></p>
        </div>
        <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
          <p className="text-[8px] text-zinc-600 font-black uppercase mb-1 tracking-widest">SNC_Score</p>
          <p className="text-xs font-bold text-white tracking-widest">94.2</p>
        </div>
      </div>

      {/* WATERMARK BACKGROUND */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 text-[12vw] font-black text-white/[0.01] pointer-events-none select-none italic uppercase">
        Wyckoff
      </div>
    </div>
  );
}