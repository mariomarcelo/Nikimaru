'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Zap, Target, Brain, Radio, Settings, ShieldCheck,
  Activity, TrendingUp, BarChart3, LineChart, Cpu
} from 'lucide-react';

export default function TerminalNikimaruPro() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [trade, setTrade] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [logs, setLogs] = useState(["SISTEMA_V25: Motor de análisis cargado. Sin órdenes activas."]);
  const [zoom, setZoom] = useState(1);
  const [pnlHist, setPnlHist] = useState(0);

  // --- 1. GESTIÓN DE TERMINAL ---
  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);

  // --- 2. CEREBRO DE LA IA (Simulación Institucional) ---
  const aiBrain = useMemo(() => {
    if (candles.length < 50) return null;

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const body = Math.abs(last.close - last.open);
    const lowWick = Math.min(last.open, last.close) - last.low;
    const highWick = last.high - Math.max(last.open, last.close);

    // Detección de Bloques de Ordenes (Order Blocks)
    const isBullishOB = lowWick > body * 2.5 && last.close > prev.close;
    const isBearishOB = highWick > body * 2.5 && last.close < prev.close;

    if (isAuto && !trade) {
      if (isBullishOB) executeVirtualTrade('LONG');
      if (isBearishOB) executeVirtualTrade('SHORT');
    }

    return { isBullishOB, isBearishOB, body, lowWick, highWick };
  }, [candles, isAuto, trade]);

  const executeVirtualTrade = (type) => {
    const entry = marketData.price;
    const stopDist = entry * 0.005; // 0.5% Stop Loss
    const targetDist = stopDist * 2.5; // 2.5 RR ratio

    setTrade({
      type,
      entry,
      sl: type === 'LONG' ? entry - stopDist : entry + stopDist,
      tp: type === 'LONG' ? entry + targetDist : entry - targetDist,
      time: new Date().toLocaleTimeString()
    });
    addLog(`IA_ALERTA: Detectado patrón institucional. Abriendo ${type} en $${entry.toLocaleString()}`);
  };

  // --- 3. MONITOR DE RIESGO ---
  useEffect(() => {
    if (!trade) return;
    const p = marketData.price;
    const isLong = trade.type === 'LONG';
    const hitSL = isLong ? p <= trade.sl : p >= trade.sl;
    const hitTP = isLong ? p >= trade.tp : p <= trade.tp;

    if (hitSL || hitTP) {
      const profit = (p - trade.entry) * (isLong ? 1 : -1);
      setPnlHist(prev => prev + profit);
      addLog(`IA_CIERRE: Posición finalizada. Resultado: ${profit > 0 ? 'PROFIT' : 'LOSS'} ($${profit.toFixed(2)})`);
      setTrade(null);
    }
  }, [marketData.price]);

  // --- 4. DATA FEED ---
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setMarketData({ price: parseFloat(d.k.c) });
      if (d.k.x) {
        setCandles(prev => [...prev.slice(-100), {
          open: parseFloat(d.k.o), high: parseFloat(d.k.h),
          low: parseFloat(d.k.l), close: parseFloat(d.k.c), vol: parseFloat(d.k.v)
        }]);
      }
    };
    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100`);
      const d = await res.json();
      setCandles(d.map(c => ({ open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4]), vol: parseFloat(c[5]) })));
    };
    fetchHistory();
    return () => ws.close();
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020202] text-zinc-400 font-mono flex flex-col overflow-hidden">
      {/* HEADER PROFESIONAL */}
      <nav className="h-14 border-b border-white/5 bg-[#080808] flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white font-black italic">
            <Cpu className="text-purple-500" size={18} />
            NIKIMARU_V25_TERMINAL
          </div>
          <div className="flex gap-4 text-[9px] font-bold border-l border-white/10 pl-6">
            <span className="text-zinc-500">ENGINE: <span className="text-purple-400">NEURAL_V25</span></span>
            <span className="text-zinc-500">SIM_PNL: <span className={pnlHist >= 0 ? "text-green-500" : "text-red-500"}>${pnlHist.toFixed(2)}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-zinc-600 font-black tracking-widest">LIVE_BTC_PRICE</span>
            <div className="text-xl font-black text-green-500 tabular-nums tracking-tighter">${marketData.price.toLocaleString()}</div>
          </div>
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all border ${isAuto ? 'bg-purple-600/10 border-purple-500 text-purple-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-500'}`}
          >
            {isAuto ? 'IA_AUTONOMY_ON' : 'MANUAL_OVERRIDE'}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* PANEL IZQUIERDO: METRICAS */}
        <aside className="w-16 border-r border-white/5 bg-[#050505] flex flex-col items-center py-6 gap-8">
          <Target className="text-purple-500 cursor-pointer" size={20} />
          <BarChart3 className="text-zinc-700 hover:text-white cursor-pointer" size={20} />
          <LineChart className="text-zinc-700 hover:text-white cursor-pointer" size={20} />
          <Settings className="text-zinc-700 hover:text-white cursor-pointer mt-auto" size={20} />
        </aside>

        {/* ÁREA CENTRAL: GRÁFICO (SIMULACIÓN VISUAL) */}
        <section className="flex-1 relative bg-black flex flex-col">
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
            <div className="bg-black/90 p-4 border border-purple-500/20 rounded-2xl backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 text-[8px] font-black text-purple-400 uppercase mb-2 tracking-widest">
                <Brain size={12} /> Neural_Analysis_Live
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-zinc-300 italic leading-snug">
                  {aiBrain?.isBullishOB ? "Detectada absorción en zona de demanda institucional." :
                    aiBrain?.isBearishOB ? "Detectada presión de venta en zona de oferta." :
                      "Escaneando flujo de órdenes en micro-temporalidades..."}
                </div>
              </div>
            </div>

            {trade && (
              <div className="bg-white/5 p-4 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="text-[8px] text-zinc-500 uppercase mb-1 font-black">Active_Position</div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black ${trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</span>
                  <span className="text-white text-[10px] font-bold">${trade.entry.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* BACKGROUND GRID */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center opacity-20">
              <Activity size={60} className="text-zinc-700 mb-4" />
              <span className="text-[10px] tracking-[1em] uppercase">Visualizer_Active</span>
            </div>
          </div>
        </section>

        {/* PANEL DERECHO: TERMINAL DE LOGS */}
        <aside className="w-80 bg-[#080808] border-l border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={12} /> System_Logs
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className={`text-[9px] leading-tight font-mono transition-all ${i === 0 ? 'text-white' : 'text-zinc-600'}`}>
                <span className="text-purple-900 mr-2">❯</span> {log}
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#0a0a0a] border-t border-white/5 space-y-3">
            <button
              onClick={() => executeVirtualTrade('LONG')}
              disabled={!!trade}
              className="w-full bg-green-600/10 border border-green-600/30 hover:bg-green-600/20 text-green-500 font-black py-3 rounded-xl text-[10px] transition-all disabled:opacity-20"
            >
              VIRTUAL_MARKET_LONG
            </button>
            <button
              onClick={() => executeVirtualTrade('SHORT')}
              disabled={!!trade}
              className="w-full bg-red-600/10 border border-red-600/30 hover:bg-red-600/20 text-red-500 font-black py-3 rounded-xl text-[10px] transition-all disabled:opacity-20"
            >
              VIRTUAL_MARKET_SHORT
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}