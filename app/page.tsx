'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Zap, Target, Brain, Radio, Settings, ShieldCheck,
  Activity, TrendingUp, BarChart3, Clock3, Lock, Unlock, Cpu, Signal
} from 'lucide-react';

export default function NikimaruTerminalV40Shadow() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [intervalo, setIntervalo] = useState('1m');
  const [trade, setTrade] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("SNC_V40: Sistema Quantum cargado. Buscando ineficiencias...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- 1. LÓGICA DE DATOS (BINANCE) ---
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${intervalo}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMarketData({ price: parseFloat(data.k.c) });
    };

    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalo}&limit=100`);
      const d = await res.json();
      setCandles(d.map(c => ({
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        vol: parseFloat(c[5])
      })));
    };

    fetchHistory();
    return () => ws.close();
  }, [intervalo]);

  // --- 2. MOTOR DE DIBUJO (CON ESTÉTICA "SHADOW PROTOCOL") ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 50;

    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP || 1;

    const getY = (price) => h - padding - ((price - minP) / range) * (h - 2 * padding);
    const candleWidth = w / candles.length;

    // Fondo Negro Absoluto y Cuadrícula Sutil
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const y = (h / 10) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      const x = (w / 10) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // Dibujar Velas (Colores Tácticos)
    candles.forEach((c, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const isBull = c.close >= c.open;

      // Mecha (Rojo/Verde Táctico de las fotos)
      ctx.strokeStyle = isBull ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Cuerpo (Estilo Shaded de TradingView)
      ctx.fillStyle = isBull ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.strokeStyle = isBull ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyBottom = getY(Math.min(c.open, c.close));
      ctx.fillRect(x - (candleWidth / 3), bodyTop, (candleWidth / 1.5), Math.max(bodyBottom - bodyTop, 1));
      ctx.strokeRect(x - (candleWidth / 3), bodyTop, (candleWidth / 1.5), Math.max(bodyBottom - bodyTop, 1));
    });

    // Líneas de Trading (Virtuales)
    if (trade) {
      const drawLevel = (price, color, label) => {
        const y = getY(price);
        ctx.setLineDash([10, 5]);
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.fillStyle = color; ctx.font = '10px monospace italic';
        ctx.fillText(`${label}: ${price.toFixed(2)}`, w - 120, y - 6);
      };
      drawLevel(trade.entry, '#fff', 'ENTRY');
      drawLevel(trade.sl, '#ef4444', 'SHADOW_STOP');
      drawLevel(trade.tp, '#22c55e', 'SNIPER_TP');
      ctx.setLineDash([]);
    }

  }, [candles, marketData, trade]);

  // --- 3. GESTIÓN DE TRADING ---
  const handleManualTrade = (type) => {
    const entry = marketData.price;
    const offset = entry * 0.001;
    setTrade({
      type, entry,
      sl: type === 'LONG' ? entry - offset : entry + offset,
      tp: type === 'LONG' ? entry + (offset * 2) : entry - (offset * 2)
    });
    setAiAnalysis(`SNC_${type}: Inestabilidad en micro-flujo detectada. Orden iniciada.`);
  };

  const getSession = () => {
    const h = new Date().getUTCHours();
    if (h >= 13 && h <= 21) return "NEW YORK SESSION";
    if (h >= 8 && h <= 16) return "LONDON SESSION";
    return "OFF_HOUR_FLOW";
  };

  return (
    <div className="h-screen w-screen bg-[#020202] text-zinc-500 font-mono flex flex-col overflow-hidden italic select-none">

      {/* HEADER DE LA TERMINAL */}
      <nav className="h-12 border-b border-red-950/20 flex items-center justify-between px-8 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-black italic text-xs tracking-tighter">
            <Signal size={16} className="text-red-600 animate-pulse" /> NIKIMARU_V40_DOMINIO
          </div>
          <div className="flex gap-1 border-l border-white/5 pl-4">
            {['1m', '5m', '15m'].map(t => (
              <button key={t} onClick={() => setIntervalo(t)} className={`px-2.5 py-0.5 text-[9px] rounded-sm transition-all ${intervalo === t ? 'bg-red-600/30 border border-red-600/60 text-white font-black' : 'hover:bg-white/5'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-[11px] font-black text-white tabular-nums tracking-tighter">${marketData.price.toLocaleString()}</div>
          <button onClick={() => setIsAuto(!isAuto)} className={`px-4 py-1.5 rounded-sm text-[9px] font-black border-2 transition-all ${isAuto ? 'bg-red-600/20 border-red-600 text-red-500 animate-pulse' : 'border-zinc-800 text-zinc-700'}`}>
            {isAuto ? 'AUTO_SNC_ACTIVE' : 'MANUAL_MODE'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* GRÁFICO Y PANELES IA FLOTANTES */}
        <main className="flex-1 bg-black p-4 relative overflow-hidden">
          <div className="w-full h-full border border-red-950/20 rounded-[2.5rem] bg-black/40 relative overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full opacity-60 grayscale brightness-110" />

            {/* HUD FLOTANTE: ANÁLISIS IA TÁCTICO */}
            <div className="absolute top-10 left-10 p-5 bg-black/90 backdrop-blur-xl border border-red-900/30 rounded-3xl max-w-sm shadow-[0_0_50px_rgba(255,0,0,0.1)]">
              <div className="flex items-center gap-2 mb-3 text-red-500 text-[10px] font-black tracking-widest uppercase">
                <Brain size={16} /> Neural_Flow_Analysis_v40
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed italic">"{aiAnalysis}"</p>
              {trade && (
                <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                  <p className="text-[9px] text-zinc-500">PNL_SIM_VIRTUAL</p>
                  <p className={`text-4xl font-black ${marketData.price > trade.entry ? 'text-green-500' : 'text-red-500'}`}>{((marketData.price - trade.entry) / trade.entry * 100).toFixed(3)}%</p>
                </div>
              )}
            </div>

            {/* HUD FLOTANTE: SESIÓN TÁCTICA */}
            <div className="absolute top-10 right-10 p-4 bg-black/90 backdrop-blur-md border border-white/5 rounded-2xl flex gap-3 items-center">
              <div className="text-[8px] font-black uppercase text-zinc-600">Sesión_SNC</div>
              <Clock3 size={14} className="text-zinc-600" />
              <div className="text-[10px] text-white font-bold">{getSession()}</div>
            </div>
          </div>
        </main>

        {/* BARRA LATERAL (CONTROL WYCKOFF) */}
        <aside className="w-72 bg-black border-l border-red-950/10 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
            <span>BINANCE:BTCUSDT</span>
            <Target size={16} className="text-red-600" />
          </div>

          <div className="bg-zinc-950 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
            <p className="text-[9px] font-black text-zinc-700 uppercase mb-4 tracking-widest border-b border-white/10 pb-2">Controles_Shadow</p>
            <button onClick={() => handleManualTrade('LONG')} className="w-full py-4 bg-green-600 text-black font-black text-[10px] hover:bg-green-400 transition-all">LONG_SHADOW</button>
            <button onClick={() => handleManualTrade('SHORT')} className="w-full py-4 bg-red-600 text-black font-black text-[10px] hover:bg-red-400 transition-all">SHORT_SNIPER</button>
          </div>

          <div className="flex-1 p-5 bg-white/5 rounded-2xl border border-white/5 overflow-y-auto space-y-4">
            <div className="text-[9px] font-black text-zinc-600 mb-4 flex items-center gap-2"><Settings size={12} /> VITAL_FLOW_DATA</div>
            <div className="space-y-3 text-[10px]">
              <div className="flex justify-between"><span>RSI_BIAS:</span> <span className="text-purple-500">NEUTRAL</span></div>
              <div className="flex justify-between"><span> VOL_PROF:</span> <span className="text-white">BAJO</span></div>
              <div className="flex justify-between"><span>SNC_CONFIDENCE:</span> <span className="text-red-500">65%</span></div>
              <div className="flex justify-between"><span>LIQUIDITY_STATUS:</span> <span className="text-green-500">SWEPT</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}