'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X } from 'lucide-react';

const MI_LLAVE = "AIzaSyCcY4l2vYCIHI2EqwcXUgJ3kr0lmIKa3IQ";

export default function NikimaruMaster() {
  const container = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Nikimaru Master Core iniciado. Sincronizando oráculos...' }]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hablarConIA = async (mensaje: string) => {
    setIsLoading(true);

    // Lista de intentos: Probamos todas las rutas que Google acepta
    const intentos = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MI_LLAVE}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${MI_LLAVE}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${MI_LLAVE}`
    ];

    let logrado = false;

    for (const url of intentos) {
      if (logrado) break;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Eres Nikimaru, una IA de trading. Responde muy breve: ${mensaje}` }] }]
          })
        });

        const data = await res.json();

        if (data.candidates && data.candidates[0].content) {
          const texto = data.candidates[0].content.parts[0].text;
          setChatHistory(prev => [...prev, { role: 'bot', text: texto }]);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(texto));
          logrado = true;
        }
      } catch (e) {
        console.log("Ruta fallida, intentando siguiente...");
      }
    }

    if (!logrado) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Error Crítico: Tu cuenta de Google tiene restringido el acceso a la API desde esta aplicación. ¿Has verificado que la API de Gemini esté 'Habilitada' en tu Google Cloud Console?" }]);
    }
    setIsLoading(false);
  };

  const handleSend = () => {
    if (!chatInput.trim() || isLoading) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
    hablarConIA(chatInput);
    setChatInput('');
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (container.current) {
        container.current.innerHTML = '';
        const s = document.createElement("script");
        s.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        s.async = true;
        s.innerHTML = JSON.stringify({ "autosize": true, "symbol": "BINANCE:BTCUSDT", "theme": "dark", "container_id": "tv_chart" });
        container.current.appendChild(s);
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans italic">
      <header className="h-12 border-b border-[#f0b90b]/20 flex items-center px-4 bg-[#161a1e] justify-between shadow-xl">
        <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase tracking-tighter">
          <Zap size={18} fill="#f0b90b" /> <span>Nikimaru Master</span>
        </div>
        <div className="text-[9px] text-zinc-500 font-mono">ENLACE TRIPLE ACTIVO</div>
      </header>

      <main className="flex-1 relative">
        <div id="tv_chart" ref={container} className="absolute inset-0" />
        <div className="absolute bottom-6 right-6 z-[1000]">
          {isChatOpen && (
            <div className="w-80 h-96 bg-[#161a1e]/95 border border-[#f0b90b]/30 rounded-2xl mb-4 flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px] flex justify-between items-center">
                <span>TERMINAL MULTI-PUENTE</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/40 scrollbar-hide">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-400 border-l border-zinc-700 pl-2' : 'text-[#f0b90b] font-bold text-right italic uppercase underline'}>{m.text}</div>
                ))}
                {isLoading && <div className="text-[10px] text-zinc-600 animate-pulse text-center">Escaneando rutas de Google...</div>}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none rounded border border-zinc-700 focus:border-[#f0b90b]" placeholder="Forzar respuesta..." />
                <button onClick={handleSend} className="bg-[#f0b90b] p-2 rounded text-black active:scale-95 transition-all"><Send size={16} /></button>
              </div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-4 rounded-full bg-[#f0b90b] text-black shadow-[0_0_20px_rgba(240,185,11,0.3)] hover:rotate-12 transition-all"><Bot size={28} /></button>
        </div>
      </main>
    </div>
  );
}