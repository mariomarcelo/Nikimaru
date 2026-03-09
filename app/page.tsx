'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Trash2, X, Send, BrainCircuit, Sparkles, Mic, MicOff, Camera, Monitor, Smartphone } from 'lucide-react';

export default function NikimaruUltimateAI() {
  const container = useRef<HTMLDivElement>(null);
  const [leverage, setLeverage] = useState(20);
  const [showLeverageModal, setShowLeverageModal] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('68250.0');

  // ESTADOS DE IA Y MULTIMODALIDAD
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hola jefe. Estoy listo. Puedo escuchar tus órdenes, analizar el mercado y, si me das acceso, ver lo que pasa en tu pantalla o cámara.' }
  ]);
  const [inputText, setInputText] = useState('');

  const toggleMic = () => {
    setIsListening(!isListening);
    // Aquí iría la lógica de Web Speech API o Whisper para procesar tu voz
  };

  const handleSendMessage = () => {
    if (!inputText) return;
    const newMessages = [...messages, { role: 'user', text: inputText }];
    setMessages(newMessages);
    setInputText('');
    setTimeout(() => {
      setMessages([...newMessages, {
        role: 'ai',
        text: 'Entendido. Estoy monitoreando las apps en segundo plano y el flujo de BTC. Todo se ve bajo control.'
      }]);
    }, 1000);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": "BINANCE:BTCUSDT", "interval": "1", "theme": "dark", "style": "1", "container_id": "tv_chart_stable"
    });
    if (container.current && container.current.children.length === 0) container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans flex flex-col overflow-hidden relative">

      {/* BURBUJA DE IA MULTIMODAL */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end">
        {isChatOpen && (
          <div className="w-85 h-[500px] bg-[#161a1e] border border-[#f0b90b]/30 rounded-3xl shadow-[0_0_50px_-12px_rgba(240,185,11,0.3)] flex flex-col overflow-hidden mb-4 animate-in fade-in zoom-in duration-300">
            {/* Header con Estado del Sistema */}
            <div className="p-4 bg-[#f0b90b] text-black flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-black ${isListening ? 'animate-ping' : ''}`} />
                <span className="font-black text-xs uppercase tracking-widest">Nikimaru OS</span>
              </div>
              <div className="flex gap-3">
                <Camera size={16} className="cursor-pointer hover:scale-110 transition-transform" />
                <Smartphone size={16} className="cursor-pointer hover:scale-110 transition-transform" />
                <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
              </div>
            </div>

            {/* Visualizador de Voz (Solo se ve cuando escuchas) */}
            {isListening && (
              <div className="h-20 bg-black/40 flex items-center justify-center gap-1 px-10">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                  <div key={i} className="w-1 bg-[#f0b90b] animate-bounce" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-[#2b3139] border border-zinc-700' : 'bg-[#f0b90b]/10 border border-[#f0b90b]/20 text-[#f0b90b]'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Multimodal */}
            <div className="p-4 bg-[#1e2329] border-t border-[#2b3139] space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Hablá o escribí..."
                  className="flex-1 bg-[#0b0e11] border-none rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 ring-[#f0b90b]"
                />
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#2b3139] text-[#f0b90b]'}`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button onClick={handleSendMessage} className="bg-[#f0b90b] p-2 rounded-xl text-black font-bold">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trigger de la IA */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`group p-5 rounded-full shadow-2xl transition-all duration-500 hover:rotate-12 ${isChatOpen ? 'bg-[#2b3139]' : 'bg-[#f0b90b] hover:shadow-[#f0b90b]/40'}`}
        >
          {isChatOpen ? <X size={32} className="text-white" /> : <BrainCircuit size={32} className="text-black group-hover:scale-110" />}
        </button>
      </div>

      {/* --- EL RESTO DE LA TERMINAL IGUAL (HEADER, CHART, ETC) --- */}
      <div className="h-10 border-b border-[#2b2f36] flex items-center px-4 bg-[#161a1e] text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
        <Zap size={14} className="text-[#f0b90b] mr-2" /> Nikimaru Terminal v4.0 (Multimodal Ready)
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[180px] border-r border-[#2b2f36] bg-[#161a1e]">
          <div className="p-4 text-center text-[#f84960] font-mono text-xs opacity-50">ORDER BOOK ACTIVE</div>
          <div className="h-full bg-gradient-to-b from-red-500/5 to-green-500/5" />
        </div>

        <div className="flex-1 flex flex-col bg-black relative">
          <div id="tv_chart_stable" ref={container} className="w-full h-full" />
          <div className="h-32 bg-[#161a1e] border-t border-[#2b2f36] p-4 font-mono text-[10px]">
            <span className="text-zinc-500">SISTEMA: OK | CÁMARA: STANDBY | SCREEN_CAPTURE: READY</span>
          </div>
        </div>

        <div className="w-[260px] border-l border-[#2b2f36] bg-[#161a1e] p-4 flex flex-col gap-4">
          <button className="w-full bg-[#2b3139] py-2 rounded text-xs text-[#f0b90b] font-bold border border-[#f0b90b]/20 hover:border-[#f0b90b]">
            CROSS {leverage}X
          </button>
          <div className="flex flex-col gap-2">
            <button className="w-full bg-[#02c076] py-3 rounded font-black text-xs uppercase" onClick={() => setPositions([{ id: Date.now(), type: 'LONG', entry: selectedPrice }, ...positions])}>Long</button>
            <button className="w-full bg-[#f84960] py-3 rounded font-black text-xs uppercase">Short</button>
          </div>
        </div>
      </div>
    </div>
  );
}