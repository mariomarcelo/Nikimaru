'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Cpu, Target, Brain, Activity, Shield, TrendingUp, Zap } from 'lucide-react';

export default function NikimaruTerminalV3() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [trade, setTrade] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [logs, setLogs] = useState(["SISTEMA_V3: Motor Neural cargado. Esperando liquidez..."]);
  const [pnlHist, setPnlHist] = useState(0);

  // --- 1. LÓGICA DE DIBUJO PROFESIONAL ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = 40;

    // Escalamiento de Precios
    const minP = Math.min(...candles.map(c => c.low));
    const maxP = Math.max(...candles.map(c => c.high));
    const range = (maxP - minP) || 1;
    const getY = (p) => h - pad - ((p - minP) / range) * (h - 2 * pad);
    const cW = (w - 2 * pad) / candles.length;

    // Fondo y Cuadrícula
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#1a1a1a';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath(); ctx.moveTo(0, (h / 10) * i); ctx.lineTo(w, (h / 10) * i); ctx.stroke();
    }

    // Dibujo de Velas
    candles.forEach((c, i) => {
      const x = pad + i * cW;
      const isUp = c.close >= c.open;
      ctx.fillStyle = isUp ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';

      // Mecha
      ctx.beginPath();
      ctx.moveTo(x + cW / 2, getY(c.high));
      ctx.lineTo(x + cW / 2, getY(c.low));
      ctx.stroke();

      // Cuerpo
      const top = getY(Math.max(c.open, c.close));
      const bot = getY(Math.min(c.open, c.close));
      ctx.fillRect(x + 1, top, cW - 2, Math.max(1, bot - top));
    });

    // Visualización de Operación Activa (Herramientas de Trading)
    if (trade) {
      // Línea de Entrada (Blanca)
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, getY(trade.entry)); ctx.lineTo(w, getY(trade.entry)); ctx.stroke();

      // Zona de Stop Loss (Roja)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      if (trade.type === 'LONG') ctx.fillRect(0, getY(trade.sl), w, h - getY(trade.sl));
      else ctx.fillRect(0, 0, w, getY(trade.sl));

      // Zona de Take Profit (Verde)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      if (trade.type === 'LONG') ctx.fillRect(0, 0, w, getY(trade.tp));
      else ctx.fillRect(0, getY(trade.tp), w, h - getY(trade.tp));
      ctx.setLineDash([]);
    }
  }, [candles, trade, marketData.price]);

  // --- 2. IA DE DETECCIÓN (SMART MONEY) ---
  const aiAnalysis = useMemo(() => {
    if (candles.length < 2) return "Analizando flujo...";
    const last = candles[candles.length - 1];
    const volAvg = candles.reduce((a, b) => a + b.vol, 0) / candles.length;

    if (last.vol > volAvg * 1.5) {
      return "ALERTA: Volumen institucional detectado. Posible Order Block.";
    }
    return "Mercado en equilibrio retail. Esperando barrido.";
  }, [candles]);

  // --- 3. CONEXIÓN REAL TIEMPO REAL ---
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      const price = parseFloat(d.k.c);
      setMarketData({ price });
      if (d.k.x) {
        setCandles(prev => [...prev.slice(-60), {
          open: parseFloat(d.k.o), high: parseFloat(d.k.h),
          low: parseFloat(d.k.l), close: price, vol: parseFloat(d.k.v)
        }]);
      }
    };
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60`)
      .then(r => r.json())
      .then(d => setCandles(d.map(c => ({
        open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4]), vol: parseFloat(c[5])
      }))));
    return () => ws.close();
  }, []);

  const openTrade = (type) => {
    const entry = marketData.price;
    const sl = type === 'LONG' ? entry * 0.995 : entry * 1.005;
    const tp = type === 'LONG' ? entry * 1.015 : entry * 0.985;
    setTrade({ type, entry, sl, tp });
    setLogs(prev => [`[SISTEMA] ${type} ejecutado en $${entry}`, ...prev]);
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-mono flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black">
        <div className="flex items-center gap-4">
          <Cpu className="text-purple-500 animate-pulse" />
          <h1 className="text-lg font-black tracking-tighter">NIKIMARU_INTEL_V3</h1>
          <div className="bg-zinc-900 px-3 py-1 rounded text-[10px] text-zinc-500 border border-white/5">
            PNL: <span className={pnlHist >= 0 ? "text-green-500" : "text-red-500"}>${pnlHist.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 font-bold uppercase">BTC/USDT LIVE</div>
          <div className="text-2xl font-black text-green-400 tabular-nums">${marketData.price.toLocaleString()}</div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* PANEL LATERAL */}
        <nav className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-black">
          <Brain className="text-purple-500 hover:scale-110 transition-transform cursor-pointer" size={24} />
          <Target className="text-zinc-600 hover:text-white cursor-pointer" size={24} />
          <Activity className="text-zinc-600 hover:text-white cursor-pointer" size={24} />
          <Shield className="text-zinc-600 hover:text-white cursor-pointer mt-auto" size={24} />
        </nav>

        {/* ÁREA DEL GRÁFICO */}
        <main className="flex-1 relative flex flex-col">
          <div className="absolute top-6 left-6 z-10 space-y-2">
            <div className="bg-black/80 border border-purple-500/30 p-4 rounded-xl backdrop-blur-md">
              <div className="text-[10px] text-purple-400 font-bold flex items-center gap-2 mb-1">
                <Zap size={12} /> IA_STATUS
              </div>
              <p className="text-xs text-zinc-300 italic">{aiAnalysis}</p>
            </div>
          </div>

          <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
        </main>

        {/* TERMINAL DE OPERACIONES */}
        <aside className="w-80 border-l border-white/10 bg-black flex flex-col">
          <div className="p-6 space-y-4">
            <button
              onClick={() => openTrade('LONG')}
              className="w-full py-4 bg-green-500/10 border border-green-500/50 text-green-500 font-black rounded-xl hover:bg-green-500 hover:text-black transition-all"
            >
              COMPRAR (LONG)
            </button>
            <button
              onClick={() => openTrade('SHORT')}
              className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 font-black rounded-xl hover:bg-red-500 hover:text-black transition-all"
            >
              VENDER (SHORT)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-6">
            <div className="text-[10px] text-zinc-600 font-bold uppercase mb-4 tracking-widest">Registros del Motor</div>
            {logs.map((log, i) => (
              <div key={i} className="text-[10px] text-zinc-400 border-l border-purple-500/30 pl-3 py-1">
                {log}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}