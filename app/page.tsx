'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X, Eye, Camera } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- PROTOCOLO GEMINI (GRATIS Y CON VISIÓN) ---
const GEMINI_KEY = "AIzaSyA7GR9DsQknVPrUTkD6flepYGQTOUFRd10";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export default function NikimaruVision() {
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'SISTEMA_VIVO: Sincronización de Sesiones (NY/LDN/ASIA) Activa.' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [marketData, setMarketData] = useState({ price: 0, volume: 0, change: 0 });
  const [precioEntrada, setPrecioEntrada] = useState(null);
  const [rawLog, setRawLog] = useState([]);
  const [alerta, setAlerta] = useState({ tipo: null, msg: "" });

  const [position, setPosition] = useState({ x: 24, y: 24 });
  const isDragging = useRef(false);

  // FUNCIÓN PARA OBTENER SESIÓN ACTUAL (Basado en Argentina GMT-3)
  const getSession = () => {
    const hour = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit', hour12: false
    });
    const h = parseInt(hour);
    if (h >= 4 && h < 11) return "LONDRES (London)";
    if (h >= 9 && h < 18) return "NUEVA YORK (NY)";
    if (h >= 20 || h < 5) return "ASIA / TOKYO";
    return "MERCADO LENTO / TRASLAPE";
  };

  // 1. WEBSOCKET CON HORA ARGENTINA
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentPrice = parseFloat(data.c);
      const currentVol = parseFloat(data.v);
      setMarketData({ price: currentPrice, volume: Math.round(currentVol), change: parseFloat(data.P) });

      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-GB', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });

      setRawLog(prev => [`[${timestamp}] $${currentPrice.toFixed(2)}`, ...prev].slice(0, 30));

      if (parseFloat(data.P) < -1.2 && currentVol > 40000) setAlerta({ tipo: 'LONG', msg: "BARRIDO" });
      else if (parseFloat(data.P) > 1.5 && currentVol > 50000) setAlerta({ tipo: 'SHORT', msg: "DISTRIBUCIÓN" });
    };
    return () => ws.close();
  }, []);

  // 2. TRADINGVIEW
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "locale": "es",
      "enable_publishing": false, "hide_top_toolbar": false, "container_id": "tv_main_phantom"
    });
    const container = document.getElementById('tv_main_phantom');
    if (container) { container.innerHTML = ''; container.appendChild(script); }
  }, []);

  // 3. DRAG LOGIC
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setPosition({ x: window.innerWidth - e.clientX - 25, y: window.innerHeight - e.clientY - 25 });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const hablarIA = async (mensaje) => {
    setIsLoading(true);
    const sesionActual = getSession();
    const horaActual = new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Argentina/Buenos_Aires' });

    try {
      const pnl = precioEntrada ? (((marketData.price - precioEntrada) / precioEntrada) * 100).toFixed(2) : "0";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Eres Nikimaru. Experto en Trading. UBICACIÓN: Argentina (GMT-3). HORA ACTUAL: ${horaActual}. SESIÓN: ${sesionActual}. Si el usuario pregunta por la sesión, responde basado estrictamente en estos datos. Responde corto y técnico.`
            },
            { role: "user", content: `CONTEXTO: BTC=${marketData.price}, PNL=${pnl}%. Msg: ${mensaje}` }
          ],
          temperature: 0.1
        })
      });
      const resData = await response.json();
      setChatHistory(prev => [...prev, { role: 'bot', text: resData.choices[0].message.content }]);
    } catch (e) { console.error("IA Offline"); }
    finally { setIsLoading(false); }
  };

  const handleSend = () => {
    if (!chatInput.trim() || isLoading) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
    hablarIA(chatInput);
    setChatInput('');
  };

  return (
    <div className="h-screen w-screen bg-[#05070a] text-white flex flex-col font-mono italic overflow-hidden select-none">

      <header className={`h-10 border-b flex items-center px-6 justify-between z-50 ${alerta.tipo ? 'bg-red-600 animate-pulse' : 'bg-[#0b0e11] border-zinc-800'}`}>
        <div className="flex items-center gap-2 font-black text-[10px] uppercase">
          <Radio size={14} className={alerta.tipo ? 'text-white' : 'text-red-600 animate-pulse'} />
          NIKIMARU_V4.1
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 flex items-center gap-1"><Clock size={10} /> {getSession()}</span>
          <span className="text-green-400 font-bold text-xs">${marketData.price.toLocaleString()}</span>
        </div>
      </header>

      <main className="flex-1 flex relative overflow-hidden">

        <aside className={`${showLog ? 'w-40' : 'w-0'} transition-all duration-300 bg-black/95 border-r border-zinc-800 flex flex-col relative z-40`}>
          <button onClick={() => setShowLog(!showLog)} className="absolute -right-6 top-1/2 -translate-y-1/2 bg-zinc-800 p-1 rounded-r border border-zinc-700 text-zinc-400">
            {showLog ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
          {showLog && (
            <div className="p-2 flex flex-col h-full overflow-hidden">
              <div className="text-[8px] text-[#f0b90b] mb-2 border-b border-zinc-800 pb-1 flex items-center gap-1 uppercase font-bold">
                <Activity size={10} /> Live_Feed_AR
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 opacity-60 scrollbar-hide">
                {rawLog.map((log, i) => <div key={i} className="text-[7px] leading-tight whitespace-nowrap">{log}</div>)}
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-black relative">
          <div id="tv_main_phantom" className="w-full h-full" />
        </section>

        <div className="absolute z-[1000] flex flex-col items-end" style={{ bottom: `${position.y}px`, right: `${position.x}px` }}>
          {isChatOpen && (
            <div className="w-[260px] h-[320px] bg-[#0b0e11]/98 border border-[#f0b90b]/40 rounded-xl flex flex-col shadow-2xl backdrop-blur-xl mb-3 overflow-hidden border-b-4 border-b-[#f0b90b]">
              <div onMouseDown={() => { isDragging.current = true; }} className="p-2 bg-[#f0b90b] text-black font-black text-[8px] flex justify-between items-center cursor-move">
                <span>TERMINAL_IA</span>
                <button onClick={() => setIsChatOpen(false)}><X size={14} /></button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto text-[9px] space-y-3 scrollbar-hide">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-400 border-l-2 border-[#f0b90b] pl-2' : 'text-[#f0b90b] text-right font-bold'}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="p-2 bg-zinc-900 flex gap-1 border-t border-zinc-800">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="bg-black flex-1 p-1.5 text-[9px] outline-none rounded border border-zinc-700 text-green-400" placeholder="Comando..." />
                <button onClick={handleSend} className="text-[#f0b90b]"><Send size={14} /></button>
              </div>
            </div>
          )}
          <button onMouseDown={() => { isDragging.current = true; }} onClick={() => !isDragging.current && setIsChatOpen(!isChatOpen)} className="p-4 rounded-full bg-[#f0b90b] text-black shadow-2xl border-2 border-black cursor-move">
            {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
          </button>
        </div>
      </main>
    </div>
  );
}
