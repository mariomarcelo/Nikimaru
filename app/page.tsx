'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Brain, Zap, ShieldAlert, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface Candle { time: number; open: number; high: number; low: number; close: number; }
interface Trade {
  id: string; type: 'LONG' | 'SHORT'; entryPrice: number;
  margin: number; leverage: number; pnl: number; pnlUsdt: number;
  candlesOpen: number;
}

export default function NikimaruV37AISniper() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastProcessedTime = useRef<number>(0);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [isAuto, setIsAuto] = useState(false);
  const [aiStatus, setAiStatus] = useState("SISTEMA_READY");
  const [balance, setBalance] = useState(200); // CAPITAL TOTAL 200 USDT

  const CONFIG = {
    MARGIN: 20,         // 10% del capital total
    LEVERAGE: 50,
    SL: -2.00,
    HOLD_CANDLES: 2,
    GROQ_KEY: "TU_KEY_AQUI" // Reemplaza con tu key real
  };

  // --- INICIALIZACIÓN DEL GRÁFICO ---
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: '#020202' }, textColor: '#71717a' },
      grid: { vertLines: { color: '#1e1e1e' }, horzLines: { color: '#1e1e1e' } },
      crosshair: { mode: 0 },
      timeScale: { borderColor: '#333', timeVisible: true, secondsVisible: false },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ffa3', downColor: '#ff3e3e', borderVisible: false,
      wickUpColor: '#00ffa3', wickDownColor: '#ff3e3e',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // --- CONSULTA A LA IA ---
  const askIAAndExecute = async (history: Candle[]) => {
    if (balance < CONFIG.MARGIN) {
      setAiStatus("BALANCE_INSUFICIENTE");
      return;
    }

    setAiStatus("IA_ANALIZANDO_MERCADO...");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${CONFIG.GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "Eres un trader profesional. Responde SOLO JSON: {\"action\": \"LONG\"} o {\"action\": \"SHORT\"} o {\"action\": \"WAIT\"}." },
            { role: "user", content: `Analiza estas velas de 5m de BTC: ${JSON.stringify(history.slice(-10))}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await res.json();
      const decision = JSON.parse(data.choices[0].message.content).action;

      if (decision === 'LONG' || decision === 'SHORT') executeOrder(decision);
      else setAiStatus("IA_DECIDIÓ_ESPERAR");
    } catch (e) {
      setAiStatus("ERROR_IA_REINTENTANDO");
    }
  };

  const executeOrder = useCallback((side: 'LONG' | 'SHORT') => {
    const newTrade: Trade = {
      id: `AI-${Date.now()}`,
      type: side,
      entryPrice: price,
      margin: CONFIG.MARGIN,
      leverage: CONFIG.LEVERAGE,
      pnl: 0, pnlUsdt: 0,
      candlesOpen: 0
    };

    setBalance(prev => prev - CONFIG.MARGIN);
    setActiveTrades(prev => [...prev, newTrade]);
    setAiStatus(`ORDEN_${side}_EJECUTADA`);
  }, [price, balance]);

  // --- MONITOR DE SALIDAS Y PNL ---
  useEffect(() => {
    if (activeTrades.length === 0) return;
    setActiveTrades(prev => {
      const toClose = prev.filter(t => t.pnlUsdt <= CONFIG.SL || t.candlesOpen >= CONFIG.HOLD_CANDLES);
      const toKeep = prev.filter(t => t.pnlUsdt > CONFIG.SL && t.candlesOpen < CONFIG.HOLD_CANDLES);

      if (toClose.length > 0) {
        let pnlTotal = 0;
        let marginTotal = 0;
        toClose.forEach(t => { pnlTotal += t.pnlUsdt; marginTotal += t.margin; });
        setBalance(b => b + marginTotal + pnlTotal);
        setAiStatus(toClose[0].pnlUsdt <= CONFIG.SL ? "STOP_LOSS_ACTIVADO" : "TIEMPO_AGOTADO");
      }
      return toKeep;
    });
  }, [price]);

  // --- WEBSOCKET DATA ---
  useEffect(() => {
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=100`)
      .then(res => res.json()).then(d => {
        const fmt = d.map((c: any) => ({
          time: c[0] / 1000, open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
        }));
        setCandles(fmt);
        if (candlestickSeriesRef.current) candlestickSeriesRef.current.setData(fmt);
      });

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_5m`);
    ws.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      const currentPrice = parseFloat(k.c);
      setPrice(currentPrice);

      const updatedCandle = {
        time: k.t / 1000, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: currentPrice
      };

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.update(updatedCandle);
      }

      if (k.x && k.t !== lastProcessedTime.current) {
        lastProcessedTime.current = k.t;
        setActiveTrades(prev => prev.map(t => ({ ...t, candlesOpen: t.candlesOpen + 1 })));
        setCandles(prev => {
          const updated = [...prev, updatedCandle];
          if (isAuto) askIAAndExecute(updated);
          return updated.slice(-100);
        });
      }
    };
    return () => ws.close();
  }, [isAuto]);

  // Actualización PNL visual
  useEffect(() => {
    if (price <= 0 || activeTrades.length === 0) return;
    setActiveTrades(prev => prev.map(t => {
      const diff = t.type === 'LONG' ? price - t.entryPrice : t.entryPrice - price;
      const p = (diff / t.entryPrice) * 100 * t.leverage;
      return { ...t, pnl: p, pnlUsdt: (t.margin * p) / 100 };
    }));
  }, [price]);

  return (
    <div className="h-screen w-screen bg-[#020202] text-white font-mono uppercase flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-500 tracking-[0.3em]">TOTAL_CAPITAL</span>
            <span className="text-2xl font-black text-[#00ffa3]">${balance.toFixed(2)}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all border ${isAuto ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-blue-600 border-blue-400 text-white'}`}
          >
            {isAuto ? 'STOP_AI_SNIPER' : 'START_AI_AUTOPILOT'}
          </button>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-3xl font-black tracking-tighter">${price.toLocaleString()}</span>
          <span className="text-[9px] text-zinc-500 flex items-center gap-2">
            <Activity size={10} className="text-[#00ffa3]" /> LIVE_BTC_FEED
          </span>
        </div>
      </div>

      <div className="flex-grow flex">
        {/* SIDEBAR LOGS */}
        <div className="w-72 border-r border-white/5 p-4 bg-black/20 flex flex-col gap-4">
          <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
            <p className="text-[8px] text-zinc-500 mb-1 flex items-center gap-2"><Brain size={12} /> AI_STATUS</p>
            <p className="text-[10px] font-bold text-blue-400 truncate">{aiStatus}</p>
          </div>

          <div className="flex-grow overflow-y-auto">
            <p className="text-[8px] text-zinc-600 mb-3 tracking-widest">ACTIVE_POSITIONS</p>
            {activeTrades.map(t => (
              <div key={t.id} className="p-4 bg-zinc-900/80 rounded-xl border border-white/5 mb-2 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${t.type === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black">{t.type} @ {t.leverage}X</span>
                  <span className={`text-lg font-black ${t.pnlUsdt >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.pnlUsdt >= 0 ? '+' : ''}{t.pnlUsdt.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-zinc-500 font-bold">
                  <span>ENTRY: {t.entryPrice.toFixed(0)}</span>
                  <span>VELAS: {t.candlesOpen}/2</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="flex justify-between text-[8px] mb-1">
              <span className="text-zinc-500">STOP_LOSS</span>
              <span className="text-red-500">-$2.00 (FIXED)</span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-zinc-500">POSITION_SIZE</span>
              <span className="text-white">20.00 USDT</span>
            </div>
          </div>
        </div>

        {/* MAIN CHART AREA */}
        <div className="flex-grow relative">
          <div ref={chartContainerRef} className="absolute inset-0" />

          {/* OVERLAY PNL TOTAL */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
            <h2 className="text-[15vw] font-black italic">
              {activeTrades.reduce((a, c) => a + c.pnlUsdt, 0).toFixed(1)}
            </h2>
          </div>

          {/* MANUAL CONTROLS */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 w-[80%] max-w-2xl">
            <button onClick={() => executeOrder('LONG')} className="flex-1 py-4 bg-green-500 text-black font-black rounded-xl text-xs hover:scale-105 transition-all flex items-center justify-center gap-2">
              <TrendingUp size={16} /> FORCE_LONG
            </button>
            <button onClick={() => {
              activeTrades.forEach(t => setBalance(b => b + t.margin + t.pnlUsdt));
              setActiveTrades([]);
            }} className="px-8 bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white hover:text-black transition-all">
              PANIC_EXIT
            </button>
            <button onClick={() => executeOrder('SHORT')} className="flex-1 py-4 bg-red-500 text-black font-black rounded-xl text-xs hover:scale-105 transition-all flex items-center justify-center gap-2">
              <TrendingDown size={16} /> FORCE_SHORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}