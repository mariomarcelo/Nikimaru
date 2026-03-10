'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X } from 'lucide-react';

// --- CONFIGURACIÓN DE FUERZA BRUTA ---
const API_KEY = "AIzaSyCcY4l2vYCIHI2EqwcXUgJ3kr0lmIKa3IQ";
// Cambiamos a la versión 'v1' (producción) y forzamos el modelo pro que es el más estable
const URL_MAESTRA = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

export default function NikimaruFinal() {
  const container = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Probando enlace alternativo... ¿Me recibes?' }]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hablarIA = async (msg: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(URL_MAESTRA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Eres Nikimaru, una IA de trading. Responde corto: ${msg}` }] }]
        })
      });
      const data = await res.json();

      if (data.error) {
        setChatHistory(prev => [...prev, { role: 'bot', text: `Google rechaza la conexión: ${data.error.message}` }]);
        return;
      }

      const respuesta = data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { role: 'bot', text: respuesta }]);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(respuesta));
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Error de enlace. El servidor de v0 no llega a Google." }]);
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
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="h-12 border-b border-zinc-800 flex items-center px-4 bg-[#161a1e] text-[#f0b90b] font-black uppercase tracking-widest">
        <Zap size={18} fill="#f0b90b" className="mr-2" /> Nikimaru OS
      </header>
      <main className="flex-1 relative">
        <div id="tv_chart" ref={container} className="absolute inset-0" />
        <div className="absolute bottom-6 right-6 z-[1000]">
          {isChatOpen && (
            <div className="w-80 h-96 bg-[#161a1e] border border-[#f0b90b]/30 rounded-2xl mb-4 flex flex-col shadow-2xl overflow-hidden">
              <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px]">TERMINAL DIRECTA</div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/40">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-400' : 'text-[#f0b90b] text-right'}>{m.text}</div>
                ))}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none rounded" placeholder="Comando..." />
                <button onClick={handleSend} className="bg-[#f0b90b] p-2 rounded text-black"><Send size={16} /></button>
              </div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-4 rounded-full bg-[#f0b90b] text-black shadow-lg"><Bot size={28} /></button>
        </div>
      </main>
    </div>
  );
}