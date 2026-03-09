'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Zap, Clock, Bot, Sparkles } from 'lucide-react';

// --- TIPOS (Inlined para evitar errores de importación) ---
type TimeFrame = '1m' | '15m' | '1h';
type CandleDirection = 'LONG' | 'SHORT' | 'NEUTRAL';
interface Position {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  side: 'LONG' | 'SHORT';
  isBreakEven: boolean;
}

// --- CARGA DINÁMICA DE COMPONENTES (Evita la pantalla blanca por SSR) ---
const TradingChart = dynamic(() => import('@/components/trading-chart').then(mod => mod.TradingChart), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">INICIALIZANDO TERMINAL...</div>
});

const OperationsConsole = dynamic(() => import('@/components/operations-console').then(mod => mod.OperationsConsole), { ssr: false });

const NikimaruChat = dynamic(() => import('@/components/nikimaru-chat').then(mod => mod.NikimaruChat), { ssr: false });

// --- CONSTANTES ---
const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '15m', label: '15M' },
  { value: '1m', label: '1M' },
];

export default function NikimaruApp() {
  // 1. Estados de Mercado
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');
  const [position, setPosition] = useState<Position | null>(null);

  // 2. Estados de la IA
  const [advice, setAdvice] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // 3. Lógica de comunicación con la IA (Internalizada para seguridad)
  const fetchNikimaruAdvice = useCallback(async () => {
    if (!isHuellaActive || currentPrice === 0) return;

    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: currentPrice,
          huella: isHuellaActive,
          tf: activeTimeframe,
          direction: candleDirection
        }),
      });
      const data = await response.json();
      setAdvice(data.text);
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsLoadingAI(false);
    }
  }, [isHuellaActive, currentPrice, activeTimeframe, candleDirection]);

  // Disparar IA cuando aparece la Huella
  useEffect(() => {
    if (isHuellaActive) fetchNikimaruAdvice();
  }, [isHuellaActive]);

  // 4. Handlers
  const handlePriceUpdate = useCallback((price: number) => setCurrentPrice(price), []);
  const handleHuellaChange = useCallback((active: boolean) => setIsHuellaActive(active), []);
  const handleDirectionChange = useCallback((dir: CandleDirection) => setCandleDirection(dir), []);

  return (
    <div className="min-h-screen h-screen bg-[#050505] text-zinc-200 flex flex-col overflow-hidden font-sans">
      {/* HEADER PROFESSIONAL */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-black/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gold/10 rounded-lg border border-gold/20">
              <Zap className="w-5 h-5 text-gold fill-gold/20" />
            </div>
            <h1 className="text-lg font-black tracking-tighter text-white">NIKIMARU <span className="text-gold">OS</span></h1>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <div className={`w-1.5 h-1.5 rounded-full ${isHuellaActive ? 'bg-gold animate-pulse shadow-[0_0_8px_rgba(255,184,0,0.8)]' : 'bg-zinc-800'}`} />
            {isHuellaActive ? 'Flow Detected' : 'Scanning Market'}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${activeTimeframe === tf.value ? 'bg-gold text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* LADO IZQUIERDO: CHART + CONSOLE */}
        <div className="flex-[3] flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 relative rounded-2xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
            <TradingChart
              timeframe={activeTimeframe}
              isActive={true}
              position={position}
              onPriceUpdate={handlePriceUpdate}
              onHuellaChange={handleHuellaChange}
              onDirectionChange={handleDirectionChange}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              candleDirection={candleDirection}
            />
          </div>

          <div className="h-64 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={isHuellaActive}
              isRayoDorado={isHuellaActive && activeTimeframe === '1m'}
              onStartHunt={(pos: Position) => setPosition(pos)}
              onClosePosition={() => setPosition(null)}
              position={position}
            />
          </div>
        </div>

        {/* LADO DERECHO: NIKIMARU AI CHAT */}
        <div className="w-[380px] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm overflow-hidden">
          <NikimaruChat
            currentPrice={currentPrice}
            isHuellaActive={isHuellaActive}
            timeframe={activeTimeframe}
            advice={advice}
            isLoading={isLoadingAI}
          />
        </div>
      </div>
    </div>
  );
}