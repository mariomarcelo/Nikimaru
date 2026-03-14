'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Zap, Target, Brain, Loader2, Activity, Radio, Lock, Unlock, Crosshair, Cpu } from 'lucide-react';

export default function NikimaruV31Final() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [intervalo, setIntervalo] = useState('1m');
  const [isAuto, setIsAuto] = useState(false);
  const [trade, setTrade] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("SNC_V31: Sistema listo. Esperando ineficiencia...");

  // --- 1. LÓGICA DE DATOS (BINANCE) ---
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${intervalo}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMarketData({ price: parseFloat(data.k.c) });
    };

    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalo}&limit=80`);
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

  // --- 2. MOTOR DE DIBUJO (CANVAS FIX) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;

    // Escalamiento de precios
    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP || 1;

    const getY = (price) => h - padding - ((price - minP) / range) * (h - 2 * padding);
    const candleWidth = w / candles.length;

    // Limpiar y dibujar fondo
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;

    // Grid
    for (let i = 0; i < 10; i++) {
      const y = (h / 10) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Dibujar Velas
    candles.forEach((c, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#22c55e' : '#ef4444';

      // Mecha
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Cuerpo
      ctx.fillStyle = color;
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyBottom = getY(Math.min(c.open, c.close));
      ctx.fillRect(x - (candleWidth / 3), bodyTop, (candleWidth / 1.5), Math.max(bodyBottom - bodyTop, 1));
    });

    // Líneas de Trade
    if (trade) {
      const drawLevel = (price, color, label) => {
        const y = getY(price);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = '10px monospace';
        ctx.fillText(label, 10, y - 5);
      };
      drawLevel(trade.entry, '#fff', 'ENTRY');
      drawLevel(trade.sl, '#ef4444', 'STOP LOSS');
      drawLevel(trade.tp, '#22c55e', 'TAKE PROFIT');
    }

  }, [candles, marketData, trade]);

  // --- 3. LÓGICA DE EJECUCIÓN ---
  const handleManualTrade = (type) => {
    const entry = marketData.price;
    const offset = entry * 0.001; // 0.1% de stop
    setTrade({
      type,
      entry,
      sl: type === 'LONG' ? entry - offset : entry + offset,
      tp: type === 'LONG' ? entry + (offset * 2) : entry - (offset * 2)
    });
    setAiAnalysis(`SNIPER_${type}: Posición iniciada. Monitoreando liquidez...`);
  };

  const pnlPerc = trade ? ((trade.type === 'LONG' ? (marketData.price - trade.entry) : (trade.entry - marketData.price)) / trade.entry) * 100 : 0;

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-400 font-mono flex flex-col overflow-hidden italic">
      {/* HEADER */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 rounded-lg border border-red-600/20">
              <Cpu size={18} className="text-red-600 animate-pulse" />
            </div>
            <span className="text-white font-black text-xs tracking-tighter uppercase">Nikimaru_V31_Quantum</span>
          </div>
          <div className="flex gap-1">
            {['1m', '5m', '15m'].map(t => (
              <button key={t} onClick={() => setIntervalo(t)} className={`px-3 py-1 text-[10px] rounded border ${intervalo === t ? 'bg-red-600 border-red-600 text-white' : 'border-white/10 hover:bg-white/5'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] text-zinc-600 font-bold uppercase">BTC_USDT_Live</p>
            <p className="text-xl font-black text-white tabular-nums tracking-tighter">${marketData.price.toLocaleString()}</p>
          </div>
          <button onClick={() => setIsAuto(!isAuto)} className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${isAuto ? 'bg-red-600/20 border-red-600 text-red-500 animate-pulse' : 'border-zinc-800 text-zinc-600'}`}>
            {isAuto ? 'AUTO_PILOT_ON' : 'MANUAL_MODE'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* MAIN CHART AREA */}
        <main className="flex-1 bg-black p-4 relative overflow-hidden">
          <div className="w-full h-full border border-white/5 rounded-[2rem] bg-[#020202] relative overflow-hidden shadow-2xl">
            {/* AQUÍ SE RENDERIZA EL GRÁFICO */}
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* OVERLAY INFO */}
            <div className="absolute top-8 left-8 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-2 text-red-500 text-[9px] font-black tracking-widest uppercase">
                <Brain size={14} /> Neural_Analysis
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed">"{aiAnalysis}"</p>
            </div>

            {trade && (
              <div className={`absolute bottom-8 right-8 p-6 rounded-3xl border-2 backdrop-blur-xl ${pnlPerc >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className="text-[9px] font-black mb-1 opacity-50 uppercase">P&L_Unrealized</p>
                <p className={`text-3xl font-black ${pnlPerc >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pnlPerc >= 0 ? '+' : ''}{pnlPerc.toFixed(3)}%</p>
              </div>
            )}
          </div>
        </main>

        {/* SIDEBAR CONTROL */}
        <aside className="w-72 bg-black border-l border-white/5 p-6 flex flex-col gap-4">
          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Controles_SNC</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleManualTrade('LONG')} className="py-4 bg-green-600/20 text-green-500 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-black transition-all">LONG</button>
              <button onClick={() => handleManualTrade('SHORT')} className="py-4 bg-red-600/20 text-red-500 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-black transition-all">SHORT</button>
            </div>
            {trade && (
              <button onClick={() => setTrade(null)} className="w-full mt-2 py-3 bg-white/5 text-white rounded-xl font-black text-[9px] uppercase hover:bg-white/10">Cerrar_Operación</button>
            )}
          </div>

          <div className="flex-1 p-4 bg-zinc-900/20 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-zinc-700 uppercase mb-4">Liquidity_Scanner</p>
            <div className="space-y-4 text-[11px]">
              <div className="flex justify-between"><span>RSI_BIAS:</span> <span className="text-white">NEUTRAL</span></div>
              <div className="flex justify-between"><span>VOL_PROF:</span> <span className="text-red-500 font-bold tracking-widest">BAJO</span></div>
              <div className="flex justify-between"><span>SNC_STATUS:</span> <span className="text-zinc-500">BUSCANDO...</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}