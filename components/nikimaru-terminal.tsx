'use client';

interface NikimaruTerminalProps {
  advice: string;
  isLoading: boolean;
  isHuellaActive: boolean;
}

export function NikimaruTerminal({ advice, isLoading, isHuellaActive }: NikimaruTerminalProps) {
  return (
    <div className="bg-black/80 border border-zinc-800 rounded-lg p-4 font-mono text-xs shadow-2xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Nikimaru_v1.0_Intel</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gold animate-pulse">
            <span className="text-lg">⚡</span>
            <span>PROCESANDO FLUJO INSTITUCIONAL...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className={`font-bold ${isHuellaActive ? 'text-gold' : 'text-zinc-500'}`}>
              {isHuellaActive ? "> [!] HUELLA DETECTADA" : "> [.] BUSCANDO RASTROS"}
            </p>
            <p className="text-zinc-300 leading-relaxed italic">
              {advice || "Paciencia, soldado. No operamos por aburrimiento, operamos por confirmación."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-zinc-800 text-[10px] text-zinc-600 flex justify-between">
        <span>STATUS: {isHuellaActive ? 'HUNTING' : 'IDLE'}</span>
        <span className="animate-pulse">_</span>
      </div>
    </div>
  );
}