'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X, Eye, Camera } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- PROTOCOLO GEMINI (GRATIS Y CON VISIÓN) ---
const GEMINI_KEY = "AIzaSyA7GR9DsQknVPrUTkD6flepYGQTOUFRd10";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export default function NikimaruVision() {
  const container = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Sensores de visión Gemini activos. Esperando órdenes, Operador...' }]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- TELEMETRÍA DE BINANCE ---
  const obtenerPrecioReal = async (symbol: string = "BTCUSDT") => {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`);
      const data = await res.json();
      return data.price;
    } catch { return "fuera de línea"; }
  };

  const hablarIA = async (mensaje: string) => {
    setIsLoading(true);
    try {
      const precio = await obtenerPrecioReal();

      // Inicializar el modelo Gemini 1.5 Flash (Soporta Imagen/Texto/Video)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptSistema = `Eres Nikimaru, una IA de trading Cyberpunk. 
      CONTEXTO ACTUAL: BTC está a ${precio} USDT. 
      INSTRUCCIÓN: Responde de forma técnica, fría y muy breve. Usa términos como 'Fractalidad', 'Order Blocks' y 'Liquidez'. 
      MENSAJE DEL USUARIO: ${mensaje}`;

      const result = await model.generateContent(promptSistema);
      const respuesta = result.response.text();

      setChatHistory(prev => [...prev, { role: 'bot', text: respuesta }]);

      // Audio-Sincronización
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(respuesta);
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);

    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "ERROR: Enlace con Gemini interrumpido." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!chatInput.trim() || isLoading) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
    hablarIA(chatInput);
    setChatInput('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (container.current) {
        container.current.innerHTML = '';
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "container_id": "tv_chart", "style": "1", "locale": "es"
        });
        container.current.appendChild(script);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0b0e11] text-white flex flex-col overflow-hidden italic font-sans">
      <header className="h-12 border-b border-[#f0b90b]/20 flex items-center px-4 bg-[#161a1e] justify-between shadow-2xl">
        <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase tracking-tighter">
          <Zap size={18} className="fill-[#f0b90b]" /> <span>Nikimaru Gemini-Vision</span>
        </div>
        <div className="text-[10px] text-blue-400 font-mono animate-pulse">● NEURAL LINK ACTIVE</div>
      </header>

      <main className="flex-1 relative">
        <div id="tv_chart" ref={container} className="absolute inset-0" />

        <div className="absolute bottom-6 right-6 z-[1000]">
          {isChatOpen && (
            <div className="w-80 h-[450px] bg-[#161a1e]/95 border border-[#f0b90b]/30 rounded-3xl mb-4 flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px] uppercase flex justify-between">
                <span>Core: Gemini 1.5 Flash</span>
                <X size={14} className="cursor-pointer" onClick={() => setIsChatOpen(false)} />
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/40 scrollbar-hide">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-300 border-l border-blue-500 pl-2' : 'text-[#f0b90b] font-bold text-right uppercase'}>
                    {m.text}
                  </div>
                ))}
                {isLoading && <div className="text-blue-400 animate-pulse text-[10px]">ANALIZANDO FLUJO DE DATOS...</div>}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none rounded border border-zinc-800 focus:border-blue-500"
                  placeholder="Comando..."
                />
                <button onClick={handleSend} className="bg-blue-600 p-2 rounded text-white hover:bg-blue-500">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-4 rounded-full bg-blue-600 text-white shadow-lg hover:scale-105 transition-transform">
            <Bot size={28} />
          </button>
        </div>
      </main>
    </div>
  );
}