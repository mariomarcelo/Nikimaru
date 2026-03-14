'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cpu, Globe, History, Bot, Settings2, Clock } from 'lucide-react';

export default function NikimaruV140Final() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(0);
  const [tf, setTf] = useState('1m');

  // --- ESTADOS DE TRADING ---
  const [balance, setBalance] = useState(10000);
  const [aiReport, setAiReport] = useState("SNC_SYSTEM: Online. Esperando señal...");
  const [isTrading, setIsTrading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [trades, setTrades] = useState([]);

  const [leverage, setLeverage] = useState(20);
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeDuration, setTradeDuration] = useState(60);

  // --- MOTOR DE DATOS (BINANCE) ---
  useEffect(() => {
    // 1. Carga inicial de datos históricos
    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${tf}&limit=80`);
        const data = await res.json();
        const formatted = data.map(c => ({
          time: c[0], open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
        }));
        setCandles(formatted);
        if (formatted.length > 0) setPrice(formatted[formatted.length - 1].close);
      } catch (err) {
        setAiReport("ERROR_DATA: No se pudo conectar con Binance");
      }
    };

    fetchHistory();

    // 2. WebSocket para tiempo real
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${tf}`);
    ws.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      const newPrice = parseFloat(k.c);
      setPrice(newPrice);

      if (k.x) { // Si la vela cierra
        setCandles(prev => [...prev.slice(1), {
          time: k.t, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: newPrice
        }]);
      }
    };

    return () => ws.close();
  }, [tf]);

  // --- MOTOR GRÁFICO (CORREGIDO PARA VISIBILIDAD) ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    // Ajustar resolución del canvas al contenedor
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const w = canvas.width;
    const h = canvas.height;
    const paddingX = 50;
    const paddingY = 30;
    const chartW = w - paddingX;
    const chartH = h - (paddingY * 2);

    const highValues = candles.map(c => c.high);
    const lowValues = candles.map(c => c.low);
    const maxP = Math.max(...highValues);
    const minP = Math.min(...lowValues);
    const range = (maxP - minP) || 1;

    const getY = (p) => paddingY + chartH - ((p - minP) / range) * chartH;
    const stepX = chartW / candles.length;

    // Fondo
    ctx.clearRect(0, 0, w, h);

    // Dibujar Velas
    candles.forEach((c, i) => {
      const x = (i * stepX) + stepX / 2;
      const isUp = c.close >= c.open;

      // Mecha
      ctx.strokeStyle = isUp ? '#00ffa3' : '#ff3355';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Cuerpo
      ctx.fillStyle = isUp ? '#00ffa3' : '#ff3355';
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyBottom = getY(Math.min(c.open, c.close));
      const bodyH = Math.max(Math.abs(bodyTop - bodyBottom), 2);
      ctx.fillRect(x - stepX / 3, bodyTop, (stepX / 3) * 2, bodyH);
    });

    // Precio Actual (Línea horizontal)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, getY(price));
    ctx.lineTo(chartW, getY(price));
    ctx.stroke();
    ctx.setLineDash([]);

    // Etiqueta de precio
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(price.toFixed(2), chartW + 5, getY(price) + 4);

  }, [candles, price]);

  useEffect(() => {
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [draw]);

  // --- EJECUCIÓN BINGX ---
  const handleTrade = useCallback(async (direction) => {
    if (isTrading) return;
    setIsTrading(true);
    setAiReport(`BINGX: Enviando ${direction}...`);

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

      const data = await response.json();

      if (data.code === 0) {
        setAiReport(`EXITO: Orden ${direction} abierta`);
        const newTrade = {
          id: data.data.orderId || Math.random().toString(36).substr(2, 5),
          type: direction === 'BUY' ? 'LONG' : 'SHORT',
          price: price,
          lev: leverage,
          margin: tradeAmount,
          timeLeft: tradeDuration,
          status: 'OPEN'
        };
        setTrades(prev => [newTrade, ...prev]);
      } else {
        setAiReport(`BINGX_ERR: ${data.msg}`);
      }
    } catch (err) {
      setAiReport("SNC_ERR: Error de servidor");
    } finally {
      setIsTrading(false);
    }
  }, [price, tradeAmount, leverage, tradeDuration, isTrading]);

  // --- IA AUTÓNOMA ---
  useEffect(() => {
    if (!isAuto) return;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.98) handleTrade('BUY');
      else if (rand < 0.02) handleTrade('SELL');
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuto, handleTrade]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020202] text-zinc-400 font-mono overflow-hidden uppercase">

      {/* HEADER */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black">
        <div className="flex items-center gap-4">
          <Cpu className="text-red-600 animate-pulse" size={20} />
          <span className="text-white font-black text-xs tracking-widest">NIKIMARU_V140_SNC</span>
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`px-3 py-1 rounded border text-[9px] font-bold transition-all ${isAuto ? 'bg-red-600 border-red-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
          >
            <Bot size={12} className="inline mr-1" /> {isAuto ? 'AUTO_ON' : 'AUTO_OFF'}
          </button>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[7px] text-zinc-500">VST_BALANCE</p>
            <p className="text-sm font-black text-green-500">${balance.toFixed(2)}</p>
          </div>
          <div className="text-right border-l border-white/10 pl-6">
            <p className="text-[7px] text-zinc-500">BTC_USDT</p>
            <p className="text-sm font-black text-white">${price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* SIDEBAR LEFT */}
        <div className="w-64 border-r border-white/5 bg-[#050505] p-4 space-y-4">
          <div className="p-4 bg-black border border-white/10 rounded-xl">
            <label className="text-[8px] text-blue-500 font-bold mb-2 block"><Clock size={10} className="inline mb-1" /> DURACIÓN</label>
            <select
              value={tradeDuration}
              onChange={(e) => setTradeDuration(parseInt(e.target.value))}
              className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-xs text-white outline-none"
            >
              <option value={60}>1 MINUTO</option>
              <option value={300}>5 MINUTOS</option>
            </select>
          </div>

          <div className="p-4 bg-black border border-white/10 rounded-xl">
            <label className="text-[8px] text-red-500 font-bold mb-2 block"><Settings2 size={10} className="inline mb-1" /> RIESGO</label>
            <div className="space-y-4">
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-full accent-red-600" />
              <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                <span>PALANCA</span>
                <span>{leverage}X</span>
              </div>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/5 p-2 text-xs text-white"
                placeholder="MARGIN"
              />
            </div>
          </div>
        </div>

        {/* CHART CENTER */}
        <div ref={containerRef} className="flex-grow relative bg-[#020202]">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {['1m', '5m', '15m'].map(item => (
              <button key={item} onClick={() => setTf(item)} className={`px-2 py-1 text-[8px] border ${tf === item ? 'bg-white text-black' : 'bg-black text-zinc-500 border-white/10'}`}>{item}</button>
            ))}
          </div>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* SIDEBAR RIGHT */}
        <div className="w-72 border-l border-white/5 bg-[#050505] p-4 flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-2">
            <p className="text-[8px] font-bold text-zinc-600 mb-4 tracking-tighter"><History size={10} className="inline mr-1" /> BINGX_HISTORY</p>
            {trades.map(t => (
              <div key={t.id} className="p-2 bg-white/5 border border-white/5 rounded text-[9px]">
                <div className="flex justify-between font-black">
                  <span className={t.type === 'LONG' ? 'text-green-500' : 'text-red-500'}>{t.type}</span>
                  <span className="text-zinc-500">{t.lev}X</span>
                </div>
                <div className="flex justify-between text-zinc-600 mt-1">
                  <span>ID: {t.id}</span>
                  <span className="text-blue-500 animate-pulse">LIVE</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 space-y-2">
            <button onClick={() => handleTrade('BUY')} className="w-full py-4 bg-green-500/10 border border-green-500/30 text-green-500 font-black text-xs hover:bg-green-500 hover:text-black transition-all">EXECUTE_LONG</button>
            <button onClick={() => handleTrade('SELL')} className="w-full py-4 bg-red-600/10 border border-red-600/30 text-red-500 font-black text-xs hover:bg-red-600 hover:text-white transition-all">EXECUTE_SHORT</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px]">
        <span className="text-blue-500 font-black italic animate-pulse tracking-widest">{aiReport}</span>
        <div className="flex items-center gap-4 text-zinc-600">
          <Globe size={10} className="text-green-500" /> BRIDGE_STATUS: ACTIVE_VST
        </div>
      </div>
    </div>
  );
}