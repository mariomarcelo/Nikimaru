'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Brain, Cpu, Activity, Clock, Globe, Shield } from 'lucide-react';

export default function NikimaruV70MultiTF() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [intervalo, setIntervalo] = useState('1m'); // TEMPORALIDAD INICIAL
  const [aiInsight, setAiInsight] = useState("SNC_CORE: Analizando fractalidad...");

  // Mapeo de temporalidades para la API de Binance
  const timeframes = [
    { label: '1M', value: '1m' },
    { label: '5M', value: '5m' },
    { label: '15M', value: '15m' },
    { label: '1H', value: '1h' },
    { label: '4H', value: '4h' },
    { label: '1D', value: '1d' },
    { label: '1S', value: '1w' }
  ];

  // --- 1. LÓGICA DE DATOS DINÁMICA ---
  useEffect(() => {
    // Cerramos cualquier socket previo y abrimos el nuevo según el intervalo
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${intervalo}`);
    ws.onmessage = (e) => setMarketData({ price: parseFloat(JSON.parse(e.data).k.c) });

    const fetchHistory = async () => {
      setAiInsight(`SNC_SYNC: Sincronizando datos de ${intervalo}...`);
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalo}&limit=120`);
      const d = await res.json();
      setCandles(d.map(c => ({
        open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
      })));
      setAiInsight(`SNC_CORE: Temporalidad ${intervalo} cargada. Fractal listo.`);
    };

    fetchHistory();
    return () => ws.close();
  }, [intervalo]); // Se dispara cada vez que el usuario cambia el botón

  // --- 2. MOTOR GRÁFICO (CENTRE-FOCUS) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const hPad = w * 0.18;
    const vPad = h * 0.22;
    const cW = w - (hPad * 2);
    const cH = h - (vPad * 2);

    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP;
    const getY = (p) => vPad + cH - ((p - minP) / range) * cH;
    const candleWidth = cW / candles.length;

    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, w, h);

    // Grid Sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i <= 6; i++) {
      const y = vPad + (cH / 6) * i;
      ctx.beginPath(); ctx.moveTo(hPad, y); ctx.lineTo(w - hPad, y); ctx.stroke();
    }

    candles.forEach((c, i) => {
      const x = hPad + (i * candleWidth) + candleWidth / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#00ffa3' : '#ff3355';

      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      ctx.fillStyle = isBull ? 'rgba(0, 255, 163, 0.1)' : 'rgba(255, 51, 85, 0.1)';
      const top = getY(Math.max(c.open, c.close));
      const bottom = getY(Math.min(c.open, c.close));
      ctx.fillRect(x - (candleWidth / 3.5), top, (candleWidth / 1.7), Math.max(bottom - top, 1));
      ctx.strokeRect(x - (candleWidth / 3.5), top, (candleWidth / 1.7), Math.max(bottom - top, 1));
    });

    // Línea de Precio Actual
    const curY = getY(marketData.price);
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath(); ctx.moveTo(hPad, curY); ctx.lineTo(w - hPad, curY); ctx.stroke();
    ctx.setLineDash([]);

  }, [candles, marketData]);

  return (
    <div className="h-screen w-screen bg-[#020202] text-[#e0e0e0] font-mono overflow-hidden select-none italic">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* HEADER SUPERIOR CON SELECTOR DE TEMPORALIDAD */}
      <div className="absolute top-6 left-0 w-full flex justify-between px-10 z-20 items-center">
        {/* Logo/Status */}
        <div className="flex items-center gap-3 bg-black/40 p-2 px-4 rounded-full border border-white/5 backdrop-blur-md">
          <Cpu size={14} className="text-red-600 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest">SNC_V70_TERMINAL</span>
        </div>

        {/* MULTI-TIMEFRAME SELECTOR (CENTRO) */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setIntervalo(tf.value)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${intervalo === tf.value
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Precio Live */}
        <div className="bg-black/40 p-2 px-4 rounded-full border border-white/5 backdrop-blur-md">
          <span className="text-white font-black text-sm tabular-nums tracking-tighter">${marketData.price.toLocaleString()}</span>
        </div>
      </div>

      {/* IA INSIGHT (IZQUIERDA) */}
      <div className="absolute top-32 left-10 w-60 p-6 bg-black/50 backdrop-blur-3xl border border-red-950/20 rounded-[2.5rem] z-30">
        <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-4 uppercase tracking-[0.2em]">
          <Brain size={14} /> Neural_Analysis
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed italic mb-4">
          "{aiInsight}"
        </p>
        <div className="space-y-3 opacity-40">
          <div className="h-[1px] bg-white/10 w-full" />
          <div className="flex justify-between text-[8px]"><span>BIAS_{intervalo}:</span> <span className="text-white">WAITING_CONFIRM</span></div>
          <div className="flex justify-between text-[8px]"><span>LIQUIDITY:</span> <span className="text-green-500">SCANNING</span></div>
        </div>
      </div>

      {/* BOTONES ACCIÓN (DERECHA) */}
      <div className="absolute top-32 right-10 w-56 flex flex-col gap-2 z-30">
        <button className="py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-zinc-500 hover:text-green-500 hover:border-green-500/50 hover:bg-green-500/10 transition-all uppercase tracking-widest">Execute_Long</button>
        <button className="py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black text-zinc-500 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all uppercase tracking-widest">Execute_Short</button>
      </div>

      {/* FOOTER INFO */}
      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-20 opacity-60">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-zinc-500" />
          <span className="text-[9px] font-black tracking-widest uppercase text-zinc-400">Main_Network_Active</span>
        </div>
        <div className="w-[1px] h-4 bg-white/10" />
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-[9px] font-black uppercase">Volatility:</span>
          <span className="text-[10px] font-bold text-white tracking-widest">Normal</span>
        </div>
      </div>

      {/* WATERMARK FRACTAL */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.015] pointer-events-none select-none italic uppercase">
        {intervalo}
      </div>
    </div>
  );
}