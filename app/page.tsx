'use client';

import { useState, useCallback, useEffect } from 'react';
import { Zap, Bot, Activity } from 'lucide-react';
import { TradingChart } from '@/components/trading-chart';
import { OperationsConsole } from '@/components/operations-console';
import { NikimaruChat } from '@/components/nikimaru-chat';
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '15m', label: '15M' },
  { value: '1m', label: '1M' },
];

export default function NikimaruApp() {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('1m');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [position, setPosition] = useState<Position | null>(null);

  // Estados de Huella por TF
  const [huella1H, setHuella1H] = useState(false);
  const [huella1M, setHuella1M] = useState(false);

  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');
  const [showFlashMessage, setShowFlashMessage] = useState(false);

  // El Rayo Dorado ocurre cuando hay huella en 1M y estamos viendo el TF de 1M
  const isRayoDorado = huella1M && activeTimeframe === '1m';

  // Efecto para el Flash Alert del Rayo Dorado
  useEffect(() => {
    if (isRayoDorado && candleDirection !== 'NEUTRAL') {
      setShowFlashMessage(true);
      const timer = setTimeout(() => setShowFlashMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isRayoDorado, candleDirection]);

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const handleHuellaChange = useCallback((active: boolean, tf: TimeFrame) => {
    if (tf === '1h') setHuella1H(active);
    else if (tf === '1m') setHuella1M(active);
  }, []);

  const handleDirectionChange = useCallback((direction: CandleDirection, tf: TimeFrame) => {
    if (tf === activeTimeframe) setCandleDirection(direction);
  }, [activeTimeframe]);

  const handleStartHunt = useCallback((newPosition: Position) => setPosition(newPosition), []);
  const handleClosePosition = useCallback(() => setPosition(null), []);

  // Lógica de Auto Break-Even
  useEffect(() => {
    if (!position || position.isBreakEven || currentPrice <= 0) return;
    const { entryPrice, stopLoss, side } = position;
    const riskDistance = Math.abs(entryPrice - stopLoss);

    if (side === 'LONG' && currentPrice >= entryPrice + riskDistance) {
      setPosition({ ...position, stopLoss: entryPrice, isBreakEven: true });
    } else if (side === 'SHORT' && currentPrice <= entryPrice - riskDistance) {
      setPosition({ ...position, stopLoss: entryPrice, isBreakEven: true });
    }
  }, [currentPrice, position]);

  return (
    <div className="min-h-screen h-screen bg-black flex flex-col overflow-hidden font-mono text-zinc-300">

      {/* HEADER TÉCNICO */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
            <Zap className={`w-5 h-5 ${isRayoDorado ? 'text-gold animate-pulse' : 'text-zinc-600'}`} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase">Nikimaru <span className="text-gold">OS v4</span></h1>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${huella1M ? 'bg-gold animate-glow' : 'bg-zinc-800'}`} />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                Trace: {huella1M ? 'INSTITUTIONAL_ACTIVE' : 'SCANNING_MARKET'}
              </span>
            </div>
          </div>
        </div>

        {/* SELECTOR DE TIMEFRAME */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeTimeframe === tf.value
                  ? 'bg-gold text-black shadow-lg shadow-gold/10'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter text-zinc-500">Live Price</div>
            <div className={`text-sm font-black ${candleDirection === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden p-3 gap-3">

        {/* ÁREA DEL GRÁFICO (Izquierda) */}
        <section className="col-span-12 lg:col-span-8 relative rounded-3xl border border-zinc-800/50 overflow-hidden bg-zinc-950 shadow-2xl">
          {TIMEFRAMES.map((tf) => (
            <div key={tf.value} className={`absolute inset-0 ${activeTimeframe === tf.value ? 'block' : 'hidden'}`}>
              <TradingChart
                timeframe={tf.value}
                isActive={activeTimeframe === tf.value}
                position={position}
                onPriceUpdate={handlePriceUpdate}
                onHuellaChange={(active) => handleHuellaChange(active, tf.value)}
                onDirectionChange={(dir) => handleDirectionChange(dir, tf.value)}
                isRayoDorado={isRayoDorado}
                candleDirection={candleDirection}
              />
            </div>
          ))}

          {/* Overlay de Direccionalidad */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 pointer-events-none">
            <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${candleDirection === 'LONG' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' :
                candleDirection === 'SHORT' ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' :
                  'bg-zinc-900/50 border-zinc-800 text-zinc-500'
              }`}>
              <Activity size={12} /> {candleDirection}
            </div>
          </div>
        </section>

        {/* PANEL DE CONTROL (Derecha) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-3 overflow-hidden">

          {/* Chat de Nikimaru AI */}
          <div className="flex-[1.4] min-h-[300px]">
            <NikimaruChat
              currentPrice={currentPrice}
              isHuellaActive={huella1M}
              timeframe={activeTimeframe}
            />
          </div>

          {/* Consola de Operaciones */}
          <div className="flex-1 rounded-3xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
            <OperationsConsole
              currentPrice={currentPrice}
              isHuellaActive={huella1M}
              isRayoDorado={isRayoDorado}
              onStartHunt={handleStartHunt}
              onClosePosition={handleClosePosition}
              position={position}
            />
          </div>
        </aside>
      </main>

      {/* ALERTA DE RAYO DORADO (Global Overlay) */}
      {showFlashMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-500">
          <div className={`px-8 py-4 rounded-2xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] font-black text-2xl flex items-center gap-4 backdrop-blur-xl ${candleDirection === 'LONG'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
              : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-rose-500/20'
            }`}>
            <Zap className="fill-current animate-bounce" />
            RAYO DORADO: {candleDirection}
          </div>
        </div>
      )}

      {/* Animación del Rayo Dorado en el Borde */}
      {isRayoDorado && (
        <div className="fixed inset-0 pointer-events-none border-[4px] border-gold/20 animate-pulse z-40" />
      )}
    </div>
  );
}