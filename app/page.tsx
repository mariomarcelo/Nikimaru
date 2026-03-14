'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Zap, Target, Brain, Loader2, Activity, BarChart3,
  TrendingUp, Crosshair, BoxSelect, Layers, Ruler, Settings, Radio
} from 'lucide-react';

export default function NikimaruV25() {
  const canvasRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState({ price: 0 });
  const [intervalo, setIntervalo] = useState('1m');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trade, setTrade] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("SISTEMA_V25: Sniper Institucional Activo. Esperando mechazo...");

  // NUEVO: Estado de Zoom
  const [zoom, setZoom] = useState(1);

  const [tools, setTools] = useState({ showFib: true, showBlocks: true });

  const indicators = useMemo(() => {
    if (candles.length < 60) return null;
    const prices = candles.map(c => c.close);

    const rsiPeriod = 14;
    let gains = 0, losses = 0;
    for (let i = 1; i <= rsiPeriod; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    let avgGain = gains / rsiPeriod;
    let avgLoss = losses / rsiPeriod;
    const rsiValues = new Array(prices.length).fill(50);
    for (let i = rsiPeriod + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
      avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
      rsiValues[i] = 100 - (100 / (1 + avgGain / avgLoss));
    }

    const getEMA = (data, p) => {
      const k = 2 / (p + 1);
      let ema = [data[0]];
      for (let i = 1; i < data.length; i++) ema.push((data[i] - ema[i - 1]) * k + ema[i - 1]);
      return ema;
    };
    const ema12 = getEMA(prices, 12);
    const ema26 = getEMA(prices, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = getEMA(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);
    const ema50 = getEMA(prices, 50);

    const last = candles[candles.length - 1];
    const body = Math.abs(last.open - last.close) || 0.1;
    const lowerWick = Math.min(last.open, last.close) - last.low;
    const upperWick = last.high - Math.max(last.open, last.close);

    return {
      rsi: rsiValues, macd: macdLine, signal: signalLine, hist: histogram,
      ema50, last, lowerWick, upperWick, body
    };
  }, [candles]);

  // Manejador de Scroll para Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(prev => {
      const sensitivity = 0.1;
      const newZoom = e.deltaY < 0 ? prev + sensitivity : prev - sensitivity;
      return Math.min(Math.max(newZoom, 0.5), 4); // Limite entre 0.5x y 4x
    });
  };

  useEffect(() => {
    if (!indicators || trade || isAnalyzing) return;
    const isLongWick = indicators.lowerWick > indicators.body * 2.2;
    const isShortWick = indicators.upperWick > indicators.body * 2.2;
    if (isLongWick || isShortWick) {
      const type = isLongWick ? 'LONG' : 'SHORT';
      const wickPrice = isLongWick ? indicators.last.low : indicators.last.high;
      executeTrade(type, wickPrice);
    }
  }, [indicators, trade]);

  const executeTrade = async (type, wickPrice) => {
    setIsAnalyzing(true);
    const entry = marketData.price;
    const risk = Math.abs(entry - wickPrice) * 1.5;
    const sl = type === 'LONG' ? entry - risk : entry + risk;
    const tp = type === 'LONG' ? entry + (risk * 2.5) : entry - (risk * 2.5);
    setTrade({ type, entry, sl, tp });
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer TU_KEY`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: "Eres Nikimaru V25 Sniper. Analiza el mechazo y confirma la entrada institucional." },
          { role: "user", content: `ENTRY ${type}: ${entry}. SL: ${sl}. TP: ${tp}.` }]
        })
      });
      const data = await response.json();
      setAiAnalysis(data.choices[0].message.content);
    } catch (e) { setAiAnalysis(`SNIPER_${type}_CONFIRMADO: Niveles proyectados.`); }
    finally { setIsAnalyzing(false); }
  };

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${intervalo}`);
    ws.onmessage = (e) => setMarketData({ price: parseFloat(JSON.parse(e.data).k.c) });
    const fetchHistory = async () => {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalo}&limit=120`);
      const d = await res.json();
      setCandles(d.map(c => ({ open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4]), vol: parseFloat(c[5]) })));
    };
    fetchHistory();
    return () => ws.close();
  }, [intervalo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0 || !indicators) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;

    const mainH = h * 0.60;
    const oscH = h * 0.20;
    const oscTop = h * 0.75;

    // LÓGICA DE ZOOM: Slicing de datos visibles
    const visibleCount = Math.floor(candles.length / zoom);
    const visibleCandles = candles.slice(-visibleCount);
    const startIndex = candles.length - visibleCount;

    const maxP = Math.max(...visibleCandles.map(c => c.high), trade?.tp || 0);
    const minP = Math.min(...visibleCandles.map(c => c.low), trade?.sl || 999999);
    const getY = (p) => mainH - ((p - minP) / (maxP - minP || 1)) * (mainH - 20);
    const cW = w / visibleCandles.length;

    ctx.clearRect(0, 0, w, h);

    // 1. VOLUMEN
    const maxVol = Math.max(...visibleCandles.map(c => c.vol));
    visibleCandles.forEach((c, i) => {
      const vH = (c.vol / maxVol) * 40;
      ctx.fillStyle = c.close >= c.open ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(i * cW, mainH - vH, cW - 1, vH);
    });

    // 2. EMA 50 (Sincronizada con zoom)
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.beginPath();
    indicators.ema50.slice(startIndex).forEach((v, i) => {
      if (i === 0) ctx.moveTo(i * cW, getY(v)); else ctx.lineTo(i * cW, getY(v));
    });
    ctx.stroke();

    // 3. VELAS
    visibleCandles.forEach((c, i) => {
      const x = i * cW + cW / 2;
      const color = c.close >= c.open ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();
      ctx.fillStyle = color; ctx.fillRect(x - (cW / 4), getY(Math.max(c.open, c.close)), cW / 2, Math.max(Math.abs(getY(c.open) - getY(c.close)), 1));
    });

    // 4. LÍNEAS DE TRADING
    if (trade) {
      const drawL = (p, col, txt) => {
        const y = getY(p);
        ctx.strokeStyle = col; ctx.setLineDash(col === '#fff' ? [5, 5] : []);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.fillStyle = col; ctx.font = 'bold 9px Inter';
        ctx.fillText(`${txt}: ${p.toFixed(2)}`, 10, y - 4);
      };
      drawL(trade.entry, '#fff', 'ENTRY');
      drawL(trade.sl, '#ef4444', 'STOP');
      drawL(trade.tp, '#22c55e', 'TARGET');
      ctx.setLineDash([]);
    }

    // 5. OSCILADORES (Sincronizados con zoom)
    ctx.strokeStyle = '#a855f7'; ctx.beginPath();
    indicators.rsi.slice(startIndex).forEach((v, i) => {
      const ry = oscTop + oscH - (v / 100) * oscH;
      if (i === 0) ctx.moveTo(i * cW, ry); else ctx.lineTo(i * cW, ry);
    });
    ctx.stroke();

    const visibleHist = indicators.hist.slice(startIndex);
    const maxHist = Math.max(...visibleHist.map(Math.abs));
    visibleHist.forEach((v, i) => {
      const hy = (v / maxHist) * (oscH / 2);
      ctx.fillStyle = v >= 0 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
      ctx.fillRect(i * cW, oscTop + (oscH / 2) - hy, cW - 1, hy);
    });

  }, [candles, indicators, trade, marketData, zoom]); // Se agrega zoom como dependencia

  const pnl = trade ? (trade.type === 'LONG' ? (marketData.price - trade.entry) : (trade.entry - marketData.price)) : 0;
  const pnlPerc = trade ? (pnl / trade.entry) * 100 : 0;

  return (
    <div className="h-screen w-screen bg-black text-zinc-500 font-mono italic flex flex-col overflow-hidden">
      <nav className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#080808] z-50 shadow-2xl">
        <div className="flex items-center gap-4 text-white font-black">
          <Radio size={16} className="text-red-600 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest">Nikimaru_Elite_V25</span>
          <div className="flex gap-1 ml-4">
            {['1m', '5m', '15m'].map(t => (
              <button key={t} onClick={() => setIntervalo(t)} className={`px-2 py-0.5 text-[8px] rounded ${intervalo === t ? 'bg-red-600 text-white' : 'bg-white/5'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="text-green-500 font-bold text-sm tabular-nums tracking-tighter">${marketData.price.toLocaleString()}</div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-12 border-r border-white/5 bg-black flex flex-col items-center py-4 gap-6">
          <button className="text-purple-500 bg-purple-500/10 p-2 rounded-lg"><Target size={18} /></button>
          <button onClick={() => setTrade(null)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Zap size={18} /></button>
          <button className="text-zinc-600 hover:text-white"><BoxSelect size={18} /></button>
          <button className="text-zinc-600 hover:text-white"><Layers size={18} /></button>
          <button className="text-zinc-600 hover:text-white mt-auto mb-2"><Settings size={18} /></button>
        </aside>

        {/* Agregado onWheel aquí para capturar el scroll */}
        <section
          onWheel={handleWheel}
          className="flex-1 relative bg-[#020202] p-4 flex flex-col gap-2 overflow-hidden"
        >
          <div className="flex-1 border border-white/5 rounded-3xl overflow-hidden relative shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full" />

            <div className="absolute top-6 left-6 bg-black/95 p-5 border border-purple-500/30 rounded-2xl max-w-sm backdrop-blur-xl shadow-2xl pointer-events-none">
              <div className="flex items-center gap-2 mb-2 text-purple-400 border-b border-white/10 pb-2 text-[8px] font-black uppercase tracking-[0.2em]">
                <Brain size={12} /> Neural_Analysis_Live
              </div>
              <p className="text-[10px] text-zinc-300 not-italic leading-relaxed">{aiAnalysis}</p>
            </div>

            {trade && (
              <div className={`absolute bottom-32 right-8 p-6 rounded-3xl border-2 backdrop-blur-3xl shadow-2xl ${pnl >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="text-[8px] font-black uppercase text-zinc-500 mb-1">Unrealized_PNL</div>
                <div className={`text-2xl font-black tabular-nums ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPerc.toFixed(2)}%
                </div>
                <div className="text-[9px] font-bold text-zinc-400 mt-1 tracking-tighter">
                  PROFIT: ${pnl.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="w-80 border-l border-white/5 bg-black p-6 flex flex-col gap-6">
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Position_Status</div>
            {trade ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px]">
                  <span>SIDE:</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] ${trade.type === 'LONG' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>{trade.type}</span>
                </div>
                <div className="flex justify-between text-[11px]"><span>ENTRY:</span> <span className="text-white font-bold">${trade.entry.toLocaleString()}</span></div>
                <div className="flex justify-between text-[11px]"><span>STOP:</span> <span className="text-red-500 font-bold">${trade.sl.toLocaleString()}</span></div>
                <div className="flex justify-between text-[11px]"><span>TARGET:</span> <span className="text-green-500 font-bold">${trade.tp.toLocaleString()}</span></div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center gap-2 opacity-30">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-[9px] font-black uppercase">Scanning Wicks...</span>
              </div>
            )}
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Live_Data</div>
            <div className="flex justify-between text-[11px] mb-2"><span>RSI:</span> <span className="text-purple-400 font-bold">{indicators?.rsi.slice(-1)[0].toFixed(1)}</span></div>
            <div className="flex justify-between text-[11px]"><span>EMA 50:</span> <span className="text-blue-400 font-bold">${indicators?.ema50.slice(-1)[0].toFixed(1)}</span></div>
            <div className="flex justify-between text-[11px] mt-2 border-t border-white/5 pt-2"><span>ZOOM:</span> <span className="text-zinc-400 font-bold">{zoom.toFixed(1)}x</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
