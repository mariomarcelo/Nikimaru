'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Bot, Send, X } from 'lucide-react';

// --- TU API KEY CON CRÉDITO ---
const MI_LLAVE = "AIzaSyCcY4l2vYCIHI2EqwcXUgJ3kr0lmIKa3IQ";
// Cambiamos a 'gemini-pro' y versión 'v1', la combinación más estable del mundo
const URL_ESTABLE = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${MI_LLAVE}`;

export default function NikimaruFinal() {
  const container = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState([{ role: 'bot', text: 'Sistemas Nikimaru Pro Online. Motor Gemini-Pro activado. ¿Qué analizamos?' }]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hablarConIA = async (mensaje: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(URL_ESTABLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Eres Nikimaru, una IA de trading. Responde muy breve: ${mensaje}` }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        setChatHistory(prev => [...prev, { role: 'bot', text: `Google dice: ${data.error.message}` }]);
        return;
      }

      const respuesta = data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { role: 'bot', text: respuesta }]);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(respuesta));

    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Fallo de conexión crítico." }]);
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
          "autosize": true, "symbol": "BINANCE:BTCUSDT", "theme": "dark", "container_id": "tv_chart"
        });
        container.current.appendChild(script);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans italic">
      <header className="h-12 border-b border-[#f0b90b]/20 flex items-center px-4 bg-[#161a1e] justify-between shadow-xl">
        <div className="flex items-center gap-2 text-[#f0b90b] font-black uppercase">
          <Zap size={18} fill="#f0b90b" /> <span>Nikimaru Ultra</span>
        </div>
      </header>

      <main className="flex-1 relative">
        <div id="tv_chart" ref={container} className="absolute inset-0" />

        <div className="absolute bottom-6 right-6 z-[1000]">
          {isChatOpen && (
            <div className="w-80 h-96 bg-[#161a1e]/95 border border-[#f0b90b]/30 rounded-2xl mb-4 flex flex-col shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px] flex justify-between items-center">
                <span>TERMINAL DE DATOS</span>
                <button onClick={() => setIsChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/20 scrollbar-hide">
                {chatHistory.map((m, i) => (
                  <div key={i} className={m.role === 'bot' ? 'text-zinc-400 border-l border-zinc-700 pl-2' : 'text-[#f0b90b] font-bold text-right'}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none rounded border border-zinc-700 focus:border-[#f0b90b]" placeholder="Analizar..." />
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