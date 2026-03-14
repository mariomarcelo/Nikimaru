'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Brain, Cpu, Bot, History, Globe, ShieldCheck, XCircle, Settings2 } from 'lucide-react';

export default function NikimaruV140BingX() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [price, setPrice] = useState(0);
  const [tf, setTf] = useState('1m');
  const [aiReport, setAiReport] = useState("SNC_SYSTEM: Online. Esperando señal de mercado...");
  const [isTrading, setIsTrading] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [trades, setTrades] = useState([]);

  // CONFIGURACIÓN DE TRADING (VINCULADO A LA UI)
  const [leverage, setLeverage] = useState(20);
  const [tradeAmount, setTradeAmount] = useState(10); // Margen en VST

  // --- MOTOR DE DATOS REALES (BINANCE) ---
  useEffect(() => {
    fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${tf}&limit=80`)
      .then(res => res.json())
      .then(data => {
        setCandles(data.map(c => ({
          time: c[0], open: parseFloat(c[1]), high: parseFloat(c[2]), low: parseFloat(c[3]), close: parseFloat(c[4])
        })));
      });

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${tf}`);
    ws.onmessage = (e) => {
      const { k } = JSON.parse(e.data);
      setPrice(parseFloat(k.c));
      if (k.x) {
        setCandles(prev => [...prev.slice(1), {
          time: k.t, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c)
        }]);
      }
    };
    return () => ws.close();
  }, [tf]);

  // --- EJECUCIÓN REAL EN BINGX VST VIA SERVERLESS ---
  const handleBingXTrade = async (side) => {
    if (isTrading) return;
    setIsTrading(true);
    setAiReport(`SNC_EXEC: Enviando ${side === 'BUY' ? 'LONG' : 'SHORT'} a BingX...`);

    try {
      const response = await fetch('/api/bingx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: "BTC-USDT",
          side: side, // "BUY" o "SELL"
          margin: tradeAmount,
          leverage: leverage
        })
      });

      const data = await response.json();

      if (data.code === 0) {
        const newTrade = {
          id: data.data.orderId,
          type: side === 'BUY' ? 'LONG' : 'SHORT',
          price: price,
          time: new Date().toLocaleTimeString()
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 10));
        setAiReport(`ORDEN EXITOSA: ID ${data.data.orderId}`);
      } else {
        // Captura el error real de BingX (ej: 401, Invalid Signature)
        setAiReport(`BINGX_ERROR: ${data.msg || 'Revisar API Keys'}`);
        console.error("Error de BingX:", data);
      }
    } catch (error) {
      setAiReport("SNC_CRITICAL: Error de conexión con Vercel");
    } finally {
      // Cooldown de 2 segundos para evitar spam de órdenes
      setTimeout(() => setIsTrading(false), 2000);
    }
  };

  // --- IA AUTÓNOMA (SNC NEURAL ENGINE) ---
  useEffect(() => {
    if (!isAuto || candles.length < 20) return;

    const brainInterval = setInterval(() => {
      if (isTrading) return;

      // Cálculo de RSI (14 periodos)
      const last15 = candles.slice(-15);
      let gains = 0, losses = 0;
      for (let i = 1; i < last15.length; i++) {
        const diff = last15[i].close - last15[i - 1].close;
        if (diff >= 0) gains += diff; else losses += Math.abs(diff);
      }
      const rs = gains / (losses || 1);
      const rsi = 100 - (100 / (1 + rs));

      setAiReport(`IA_SCAN: RSI ${rsi.toFixed(2)} | ANALIZANDO BLOQUES...`);

      // GATILLOS DE IA (SNC LOGIC)
      if (rsi < 30) {
        setAiReport("SNC_BRAIN: SOBREVENTA DETECTADA. ¡LONG!");
        handleBingXTrade('BUY');
      } else if (rsi > 70) {
        setAiReport("SNC_BRAIN: SOBRECOMPRA DETECTADA. ¡SHORT!");
        handleBingXTrade('SELL');
      }
    }, 5000); // Escaneo cada 5 segundos

    return () => clearInterval(brainInterval);
  }, [isAuto, isTrading, candles, tradeAmount, leverage]);

  // --- MOTOR GRÁFICO (CANVAS) ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;
    const ctx = canvas.getContext('2d');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const w = canvas.width; const h = canvas.height;
    const pX = 50; const pY = 40;
    const cW = w - pX; const cH = h - (pY * 2);

    const maxP = Math.max(...candles.map(c => c.high));
    const minP = Math.min(...candles.map(c => c.low));
    const range = maxP - minP;
    const getY = (p) => pY + cH - ((p - minP) / (range || 1)) * cH;
    const stepX = cW / candles.length;

    ctx.clearRect(0, 0, w, h);

    // Velas Japonesas
    candles.forEach((c, i) => {
      const x = (i * stepX) + stepX / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? '#00ffa3' : '#ff3355';
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(x, getY(c.high)); ctx.lineTo(x, getY(c.low)); ctx.stroke();
      ctx.fillStyle = isUp ? 'rgba(0, 255, 163, 0.3)' : 'rgba(255, 51, 85, 0.3)';
      ctx.fillRect(x - stepX / 3, getY(Math.max(c.open, c.close)), (stepX / 3) * 2, Math.max(Math.abs(getY(c.open) - getY(c.close)), 1));
    });
  }, [candles]);

  useEffect(() => {
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [draw]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020202] text-zinc-400 font-mono uppercase italic overflow-hidden">

      {/* HEADER */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1 rounded text-white animate-pulse"><Cpu size={16} /></div>
          <span className="text-white font-black tracking-tighter text-xs">NIKIMARU_V140_BINGX</span>
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`flex items-center gap-2 px-3 py-1 rounded border text-[9px] font-black transition-all ${isAuto ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 text-zinc-500'}`}
          >
            <Bot size={12} /> {isAuto ? 'IA_SNC_ACTIVE' : 'IA_SNC_STANDBY'}
          </button>
        </div>
        <div className="text-right">
          <p className="text-[7px] text-zinc-600 font-bold">LIVE_BTC_USDT</p>
          <p className="text-sm font-black text-white tabular-nums">${price.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* PANEL IZQUIERDO */}
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-4 bg-[#050505]">
          <div className="p-4 bg-black/60 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-black mb-4"><Settings2 size={12} /> PARAMS</div>
            <label className="text-[8px] text-zinc-500 block">APALANCAMIENTO: {leverage}X</label>
            <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg accent-red-600 mb-4" />
            <label className="text-[8px] text-zinc-500 block uppercase">Margen (VST)</label>
            <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseInt(e.target.value))} className="w-full bg-black border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-red-600" />
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex-grow">
            <p className="text-zinc-600 mb-2 font-bold text-[8px] tracking-widest uppercase">System_Intel:</p>
            <p className="text-blue-400 text-[10px] leading-tight normal-case">"{aiReport}"</p>
          </div>
        </div>

        {/* CENTRO: CHART */}
        <div ref={containerRef} className="flex-grow relative bg-[#020202]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
        </div>

        {/* PANEL DERECHO */}
        <div className="w-72 border-l border-white/5 p-4 flex flex-col gap-4 bg-[#050505]">
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-[8px] font-black text-zinc-500 mb-4 tracking-widest"><History size={12} /> BINGX_POSITIONS</div>
            <div className="flex-grow overflow-y-auto space-y-2">
              {trades.map(trade => (
                <div key={trade.id} className="p-2 bg-white/5 border border-white/5 rounded text-[9px]">
                  <div className="flex justify-between font-black">
                    <span className={trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}>{trade.type}</span>
                    <span className="text-zinc-600">ID:{trade.id}</span>
                  </div>
                  <div className="text-zinc-500">ENTRADA: ${trade.price}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBingXTrade('BUY')} disabled={isTrading || isAuto} className="flex-grow py-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-black text-[10px] hover:bg-green-500 hover:text-black transition-all">LONG</button>
            <button onClick={() => handleBingXTrade('SELL')} disabled={isTrading || isAuto} className="flex-grow py-4 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all">SHORT</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-bold text-zinc-600 uppercase">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Globe size={10} className="text-green-500" /> BingX_VST_Active</span>
          <span className="flex items-center gap-1"><ShieldCheck size={10} /> Neural_Core_v1.4</span>
        </div>
      </div>
    </div>
  );
}