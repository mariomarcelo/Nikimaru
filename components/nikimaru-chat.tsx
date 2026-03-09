import { Bot, Zap } from 'lucide-react';

export function NikimaruChat({ advice, isLoading, isHuellaActive }: any) {
  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl h-full font-mono">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
        <Bot className="text-gold w-4 h-4" />
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Nikimaru Intelligence</span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gold animate-pulse text-xs">ANALIZANDO FLUJO...</div>
        ) : (
          <div className="text-xs text-zinc-300 leading-relaxed italic">
            {advice || "Esperando rastro de ballenas en el libro de órdenes..."}
          </div>
        )}
      </div>
    </div>
  );
}