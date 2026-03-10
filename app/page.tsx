'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, X, Send, Bot, Maximize2, Minimize2, DollarSign, Target, Tag, Mic, TrendingUp, Volume2, VolumeX } from 'lucide-react';

export default function NikimaruUltimateTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [livePrice, setLivePrice] = useState(68250.0);
  const [positions, setPositions] = useState<any[]>([]);

  // TRADING CONTROLS
  const [entryPrice, setEntryPrice] = useState('68250.0');
  const [amount, setAmount] = useState('100');
  const [leverage, setLeverage] = useState(20);
  const [chatInput, setChatInput] = useState('');

  // VOICE & BOT LOGIC
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Sistemas listos. ¿Qué orden tienes para mí?' }]);

  // BOT UI STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // --- LÓGICA DE VOZ (SALIDA) ---
  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel(); // Detener voces anteriores
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.pitch = 0.9; // Un tono un poco más robótico/serio
    window.speechSynthesis.speak(utterance);
  };

  // --- LÓGICA DE MICRÓFONO (ENTRADA) ---
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta reconocimiento de voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg = { role: 'user', text };
    setChatHistory(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulación de respuesta de Nikimaru
    setTimeout(() => {
      const botResponse = "Entendido. Procesando comando: " + text.toUpperCase();
      setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
      speak(botResponse);
    }, 600);
  };

  // --- MOTOR DE PRECIO ---
  useEffect(() => {
    const interval = setInterval(() => {
      const p = livePrice + (Math.random() - 0.5) * 12;
      setLivePrice(p);
      const rows = (b: number, t: 'ask' | 'bid') => Array.from({ length: 12 }, (_, i) => ({
        p: (t === 'ask' ? b + (12 - i) * 1.5 : b - i * 1.5).toFixed(1),
        q: (Math.random() * 2.5).toFixed(3)
      }));
      setOrderBook({ asks: rows(p, 'ask'), bids: rows(p, 'bid') });
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  // --- TRADINGVIEW INTEGRATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (container.current) {
        container.current.innerHTML = '';
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1",
          "theme": "dark", "style": "1", "locale": "es",
          "container_id": "tv_chart", "width": "100%", "height": "100%",
        });
        container.current.appendChild(script);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullScreen]);

  // --- DRAG LOGIC ---
  const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStartPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseUp = (e: React.MouseEvent) => {
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist < 6) setIsChatOpen(!isChatOpen);
    setIsDragging(false);
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setBotPos({ x: window.innerWidth - e.clientX - 30, y: window.innerHeight - e.clientY - 30 });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isDragging]);

  return (
    <div className="h-screen w-screen bg-[#0b0e11] text-[#eaecef] flex flex-col overflow-hidden select-none">

      {/* HEADER */}
      {!isFullScreen && (
        <header className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50 shrink-0">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic tracking-tighter uppercase">
            <Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={12} /> MODO ANÁLISIS
          </button>
        </header>
      )}

      {/* CUERPO PRINCIPAL */}
      <div className={`flex flex-1 overflow-hidden relative`}>

        {/* CAJA 1: ORDER BOOK */}
        {!isFullScreen && (
          <aside className="w-[170px] border-r border-[#2b2f36] flex flex-col bg-[#161a1e] font-mono text-[9px] shrink-0">
            <div className="p-2 border-b border-[#2b2f36] text-[8px] font-black text-zinc-500 text-center uppercase">Order Book</div>
            <div className="flex-1 flex flex-col justify-end overflow-hidden">
              {orderBook.asks.map((a, i) => (
                <div key={i} className="flex justify-between px-2 py-[1px] text-[#f84960] hover:bg-red-500/10 cursor-pointer">
                  <span>{a.p}</span><span>{a.q}</span>
                </div>
              ))}
            </div>
            <div className="p-2 text-xs font-black text-[#02c076] bg-black/40 border-y border-[#2b2f36] text-center italic">${livePrice.toFixed(1)}</div>
            <div className="flex-1 overflow-hidden">
              {orderBook.bids.map((b, i) => (
                <div key={i} className="flex justify-between px-2 py-[1px] text-[#02c076] hover:bg-green-500/10 cursor-pointer">
                  <span>{b.p}</span><span>{b.q}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* CAJA 2: CHART */}
        <main className="flex-1 flex flex-col bg-black relative min-w-0 h-full">
          {isFullScreen && (
            <button onClick={() => setIsFullScreen(false)} className="absolute top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 shadow-2xl font-black text-[10px] flex items-center gap-2 hover:bg-[#f0b90b] hover:text-black transition-all">
              <Minimize2 size={14} /> VOLVER A TERMINAL
            </button>
          )}
          <div className="flex-1 w-full h-full relative">
            <div id="tv_chart" ref={container} className="absolute inset-0 w-full h-full" />
          </div>
          {!isFullScreen && (
            <section className="h-48 border-t border-[#2b2f36] bg-[#161a1e] p-4 text-[10px] text-zinc-500 uppercase font-black">
              <TrendingUp size={12} className="inline mr-2 text-[#f0b90b]" /> Posiciones activas aparecerán aquí...
            </section>
          )}
        </main>

        {/* CAJA 3: PANEL DE CONTROL */}
        {!isFullScreen && (
          <aside className="w-[250px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 shrink-0 shadow-2xl">
            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700">
              <span className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Monto USDT</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>
            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-2"><span>Apalancamiento</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b] cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
              <button className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#01a666] active:scale-95 transition-all">Buy / Long</button>
              <button className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#d13a4d] active:scale-95 transition-all">Sell / Short</button>
            </div>
          </aside>
        )}
      </div>

      {/* --- NIKIMARU BOT CON VOZ --- */}
      <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[1000] flex flex-col items-end pointer-events-none">
        {isChatOpen && (
          <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-[32px] shadow-2xl flex flex-col overflow-hidden mb-6 pointer-events-auto">
            {/* Header del Chat */}
            <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[11px] uppercase shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={16} /> Nikimaru Terminal
              </div>
              <div className="flex gap-2">
                {/* INTERRUPTOR DE VOZ */}
                <button
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-1.5 rounded-full transition-all ${isVoiceEnabled ? 'bg-black/20 text-black' : 'bg-red-500/20 text-red-700'}`}
                >
                  {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setIsChatOpen(false)} className="bg-black/10 p-1.5 rounded-full"><X size={16} /></button>
              </div>
            </div>

            {/* Historial de Chat */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#0b0e11]/90 flex flex-col gap-3 scrollbar-hide text-[11px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'bot' ? 'bg-[#2b3139] text-zinc-100 self-start rounded-tl-none border border-zinc-700' : 'bg-[#f0b90b] text-black self-end rounded-tr-none font-bold'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input de Chat con Micro */}
            <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                  className="bg-[#0b0e11] flex-1 rounded-xl px-4 text-[11px] text-white py-3 outline-none border border-zinc-800 focus:border-[#f0b90b]/40"
                  placeholder="Escribe o pulsa el micro..."
                />
                <button
                  onClick={() => handleSendMessage(chatInput)}
                  className="bg-[#f0b90b] p-3 rounded-xl text-black hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>

              {/* BOTÓN DE MICRÓFONO */}
              <button
                onClick={startListening}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black transition-all border ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-[#2b3139] border-zinc-700 text-[#f0b90b] hover:bg-[#363c45]'}`}
              >
                <Mic size={14} /> {isListening ? 'ESCUCHANDO...' : 'DICTAR COMANDO'}
              </button>
            </div>
          </div>
        )}

        {/* Cuerpo del Bot (Círculo) */}
        <div
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          className={`pointer-events-auto p-4 rounded-full shadow-[0_0_30px_rgba(240,185,11,0.4)] cursor-grab active:cursor-grabbing hover:scale-110 transition-all border-2 border-black/10 ${isListening ? 'bg-red-500 animate-bounce' : 'bg-[#f0b90b]'}`}
        >
          <Bot size={32} className="text-black" />
        </div>
      </div>
    </div>
  );
}