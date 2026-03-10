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

  // VOICE & AI BRAIN STATES
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Cerebro táctico en línea. Dame una orden (Compra/Vende/Precio).' }]);

  // BOT UI STATES
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [botPos, setBotPos] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [orderBook, setOrderBook] = useState({ asks: [] as any[], bids: [] as any[] });

  // --- [NUEVO] EL CEREBRO DE NIKIMARU ---
  const processAICOMMAND = (text: string) => {
    const cmd = text.toLowerCase();

    // 1. INTENCIÓN: COMPRAR (LONG)
    if (cmd.includes("compra") || cmd.includes("long") || cmd.includes("sube")) {
      handleTrade('LONG');
      return "Órden de COMPRA ejecutada al mercado. ¡Vamos al alza!";
    }

    // 2. INTENCIÓN: VENDER (SHORT)
    if (cmd.includes("vende") || cmd.includes("short") || cmd.includes("baja")) {
      handleTrade('SHORT');
      return "Órden de VENTA (Short) confirmada. Posición abierta.";
    }

    // 3. INTENCIÓN: PRECIO
    if (cmd.includes("precio") || cmd.includes("cuánto")) {
      return `El precio actual de BTC es $${livePrice.toFixed(2)} USDT.`;
    }

    // 4. INTENCIÓN: CERRAR TODO
    if (cmd.includes("cierra") || cmd.includes("sal de todo") || cmd.includes("liquidar")) {
      setPositions([]);
      return "Todas las posiciones han sido cerradas. Estamos en cash.";
    }

    // 5. INTENCIÓN: LIMPIAR CHAT
    if (cmd.includes("limpia") || cmd.includes("borra")) {
      setChatHistory([{ role: 'bot', text: 'Memoria purgada. ¿Siguiente movimiento?' }]);
      return null;
    }

    return "Comando no reconocido por mi sistema. Intenta: 'Compra Bitcoin' o 'Cierra todo'.";
  };

  // --- LÓGICA DE VOZ Y MENSAJES ---
  const speak = (text: string) => {
    if (!isVoiceEnabled || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setChatInput('');

    // El cerebro procesa el mensaje
    setTimeout(() => {
      const response = processAICOMMAND(text);
      if (response) {
        setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
        speak(response);
      }
    }, 500);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => handleSendMessage(event.results[0][0].transcript);
    recognition.start();
  };

  // --- MOTOR DE TRADING ---
  const handleTrade = (type: 'LONG' | 'SHORT') => {
    const entry = livePrice;
    setPositions(prev => [{ id: Date.now(), type, entry, leverage, amount: parseFloat(amount) }, ...prev]);
  };

  const closePosition = (id: number) => setPositions(prev => prev.filter(p => p.id !== id));

  // --- MOTOR DE PRECIO (Simulado) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => prev + (Math.random() - 0.5) * 15);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- TRADINGVIEW INTEGRATION (REPARADO) ---
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
    if (Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y) < 6) setIsChatOpen(!isChatOpen);
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
        <header className="h-12 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] justify-between z-50">
          <div className="flex items-center gap-2 text-[#f0b90b] font-black italic uppercase tracking-tighter">
            <Zap size={18} fill="#f0b90b" /><span>Nikimaru OS</span>
          </div>
          <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 bg-[#2b3139] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#f0b90b] hover:text-black transition-all">
            <Maximize2 size={12} /> MODO ANÁLISIS
          </button>
        </header>
      )}

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* CAJA 1: SIDEBAR (Simulada) */}
        {!isFullScreen && (
          <aside className="w-[170px] border-r border-[#2b2f36] bg-[#161a1e] p-2 flex flex-col gap-1 overflow-hidden font-mono text-[9px] text-[#f84960]">
            <div className="text-center text-zinc-500 mb-2 uppercase text-[8px] font-black italic border-b border-zinc-800 pb-1">Live Orderbook</div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex justify-between px-1 opacity-60"><span>{(livePrice + (20 - i) * 2).toFixed(1)}</span><span>{(Math.random() * 2).toFixed(2)}</span></div>
            ))}
          </aside>
        )}

        {/* CAJA 2: CHART + POSICIONES */}
        <main className="flex-1 flex flex-col bg-black relative min-w-0 h-full">
          {isFullScreen && (
            <button onClick={() => setIsFullScreen(false)} className="absolute top-4 right-4 z-[999] bg-[#161a1e]/90 text-[#f0b90b] px-4 py-2 rounded-xl border border-[#f0b90b]/40 font-black text-[10px] flex items-center gap-2">
              <Minimize2 size={14} /> VOLVER A TERMINAL
            </button>
          )}
          <div className="flex-1 w-full h-full relative">
            <div id="tv_chart" ref={container} className="absolute inset-0 w-full h-full" />
          </div>

          {!isFullScreen && (
            <section className="h-52 border-t border-[#2b2f36] bg-[#161a1e] p-3 overflow-y-auto">
              <div className="flex items-center gap-2 text-[9px] font-black text-[#f0b90b] uppercase mb-3 tracking-widest border-l-2 border-[#f0b90b] pl-2">
                <TrendingUp size={12} /> Posiciones Activas (Modo Cerebro)
              </div>
              <div className="space-y-2">
                {positions.length === 0 && <div className="text-[10px] text-zinc-600 italic mt-4 text-center">Sin posiciones abiertas. Usa el micro y di "Compra".</div>}
                {positions.map(p => {
                  const diff = p.type === 'LONG' ? livePrice - p.entry : p.entry - livePrice;
                  const pnl = ((diff / p.entry) * p.leverage * 100).toFixed(2);
                  return (
                    <div key={p.id} className={`bg-black/40 p-3 rounded-xl border-l-4 ${parseFloat(pnl) >= 0 ? 'border-green-500' : 'border-red-500'} flex justify-between items-center animate-in fade-in slide-in-from-left-4`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black ${p.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{p.type} {p.leverage}x | ${p.amount} USDT</span>
                        <span className="text-[9px] text-zinc-500">Entry: {p.entry.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-black ${parseFloat(pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pnl}%</span>
                        <button onClick={() => closePosition(p.id)} className="bg-zinc-800 p-1.5 rounded-lg hover:bg-red-500 transition-colors"><X size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* CAJA 3: PANEL DE CONTROL */}
        {!isFullScreen && (
          <aside className="w-[250px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4 shrink-0 shadow-2xl">
            <div className="bg-[#2b3139] p-3 rounded-xl border border-zinc-700">
              <span className="text-[8px] font-black text-zinc-500 uppercase block mb-2">Inversión (USDT)</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-right text-lg font-mono text-white outline-none" />
            </div>
            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800">
              <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase mb-2"><span>Apalancamiento</span><span className="text-[#f0b90b]">{leverage}x</span></div>
              <input type="range" min="1" max="125" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-1.5 accent-[#f0b90b] cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
              <button onClick={() => handleTrade('LONG')} className="bg-[#02c076] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#01a666] active:scale-95 transition-all">Buy / Long</button>
              <button onClick={() => handleTrade('SHORT')} className="bg-[#f84960] py-4 rounded-xl font-black uppercase text-[10px] text-white border-b-4 border-[#d13a4d] active:scale-95 transition-all">Sell / Short</button>
            </div>
          </aside>
        )}
      </div>

      {/* --- NIKIMARU BOT CON CEREBRO --- */}
      <div style={{ bottom: `${botPos.y}px`, right: `${botPos.x}px` }} className="fixed z-[1000] flex flex-col items-end pointer-events-none">
        {isChatOpen && (
          <div className="w-80 h-[450px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-[32px] shadow-2xl flex flex-col overflow-hidden mb-6 pointer-events-auto animate-in slide-in-from-bottom-5">
            <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center font-black text-[11px] uppercase shrink-0">
              <div className="flex items-center gap-2"><Bot size={16} /> Nikimaru Cerebro v1</div>
              <div className="flex gap-2">
                <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`p-1.5 rounded-full transition-all ${isVoiceEnabled ? 'bg-black/20 text-black' : 'bg-red-500/20 text-red-700'}`}>
                  {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => setIsChatOpen(false)} className="bg-black/10 p-1.5 rounded-full"><X size={16} /></button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#0b0e11]/95 flex flex-col gap-3 text-[11px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'bot' ? 'bg-[#2b3139] text-zinc-100 self-start rounded-tl-none border border-zinc-700' : 'bg-[#f0b90b] text-black self-end rounded-tr-none font-bold'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#1e2329] border-t border-[#2b2f36] flex flex-col gap-2">
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)} className="bg-[#0b0e11] flex-1 rounded-xl px-4 text-[11px] text-white py-3 outline-none border border-zinc-800" placeholder="Orden de voz o texto..." />
                <button onClick={() => handleSendMessage(chatInput)} className="bg-[#f0b90b] p-3 rounded-xl text-black active:scale-95 transition-all"><Send size={18} /></button>
              </div>
              <button onClick={startListening} className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black transition-all border ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-[#2b3139] border-zinc-700 text-[#f0b90b] hover:bg-zinc-700'}`}>
                <Mic size={14} /> {isListening ? 'ESCUCHANDO ORDEN...' : 'ACTIVAR MICROFONO'}
              </button>
            </div>
          </div>
        )}

        <div onMouseDown={onMouseDown} onMouseUp={onMouseUp} className={`pointer-events-auto p-4 rounded-full shadow-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-all border-2 border-black/10 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#f0b90b]'}`}>
          <Bot size={32} className="text-black" />
        </div>
      </div>
    </div>
  );
}