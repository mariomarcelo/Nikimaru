'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X } from 'lucide-react';

// --- USANDO TU LLAVE DE GEMINI CON CRÉDITO ---
const MI_LLAVE = "AIzaSyCcY4l2vYCIHI2EqwcXUgJ3kr0lmIKa3IQ";
// Cambiamos a la versión v1 y modelo flash que es el más compatible
const URL_FINAL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${MI_LLAVE}`;

export default function NikimaruTerminal() {
  const container = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Enlace neuronal Gemini Pro (Paid) establecido. ¿Qué activo analizamos?' }]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hablarConIA = async (mensaje: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(URL_FINAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Eres Nikimaru, una IA de trading Cyberpunk. Responde muy breve y técnico: ${mensaje}` }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        // Si hay error, lo mostramos detallado para saber qué dice Google exactamente
        setChatHistory(prev => [...prev, { role: 'bot', text: `Error ${data.error.code}: ${data.error.message}` }]);
        return;
      }

      const respuesta = data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { role: 'bot', text: respuesta }]);

      // Voz
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(respuesta);
      u.lang = 'es-ES';
      window.speechSynthesis.speak(u);

    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Error de red. Revisa tu conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!chatInput.trim() || isLoading) return;
    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
    hablarConIA(chatInput);
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
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "interval": "1",
          "theme": "dark",
          "style": "1",
          "locale": "es",
          "container_id": "tv_chart"
        });
        container.current.appendChild(script);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      <header className="h-12 border-b border-zinc-800 flex items-center px-4 bg-[#161a1e] text-[#f0b90b] font-black italic uppercase">
        <Zap size={18} fill="#f0b90b" className="mr-2" /> Nikimaru OS
      </header>

      <main className="flex-1 relative">
        <div id="tv_chart" ref={container} className="absolute inset-0" />

        <div className="absolute bottom-6 right-6 z-[1000]">
          {isChatOpen && (
            <div className="w-80 h-96 bg-[#161a1e]/95 border border-[#f0b90b]/30 rounded-2xl mb-4 flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px] flex justify-between items-center">
                <span>NIKIMARU PAID CORE</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/40 scrollbar-hide">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-400 border-l border-zinc-700 pl-2' : 'text-[#f0b90b] font-bold text-right'}>
                    {m.text}
                  </div>
                ))}
                {isLoading && <div className="text-[10px] text-zinc-600 animate-pulse">Consultando el oráculo...</div>}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none rounded border border-zinc-700 focus:border-[#f0b90b]"
                  placeholder="Comando de trading..."
                />
                <button onClick={handleSend} className="bg-[#f0b90b] p-2 rounded text-black"><Send size={16} /></button>
              </div>
            </div>
          )}
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="p-4 rounded-full bg-[#f0b90b] text-black shadow-lg hover:scale-105 transition-all">
            <Bot size={28} />
          </button>
        </div>
      </main>
    </div>
  );
}