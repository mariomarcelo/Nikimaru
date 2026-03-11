          </div >
        )}

{/* --- CHAT CLÁSICO (SOLO SI HALCÓN ESTÁ APAGADO) --- */ }
{
  !isHalconMode && (
    <div style={{ left: `${botPos.x}px`, top: `${botPos.y}px` }} className="absolute z-[1000] flex flex-col items-end">
      {isChatOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-[400px] bg-[#161a1e]/95 border border-[#f0b90b]/30 rounded-3xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-3 bg-[#f0b90b] text-black font-black text-[10px] uppercase flex justify-between items-center">
            <span>Nikimaru SNC</span>
            <X size={14} className="cursor-pointer" onClick={() => setIsChatOpen(false)} />
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-[11px] space-y-3 bg-black/40 scrollbar-hide">
            {chatHistory.map((m, i) => (
              <div key={i} className={m.role === 'bot' ? 'text-zinc-400 border-l border-zinc-700 pl-2' : 'text-[#f0b90b] font-bold text-right italic'}>{m.text}</div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="bg-zinc-900 flex-1 p-2 text-[11px] outline-none text-white rounded" placeholder="Escribe..." />
            <button onClick={handleSend} className="bg-[#f0b90b] p-2 rounded text-black"><Send size={16} /></button>
          </div>
        </div>
      )}
      <button onMouseDown={() => setIsDraggingBot(true)} onClick={() => !isDraggingBot && setIsChatOpen(!isChatOpen)} className={`p-5 rounded-full bg-[#f0b90b] text-black shadow-[0_0_20px_rgba(240,185,11,0.6)] cursor-move`}>
        <Bot size={32} className="animate-pulse" />
      </button>
    </div>
  )
}

{/* FEED DE OBS */ }
{
  stream && (
    <div style={{ left: `${monitorPos.x}px`, top: `${monitorPos.y}px` }} className="absolute z-[500]">
      <div className={`border-2 border-[#f0b90b]/50 bg-black rounded-sm overflow-hidden flex flex-col shadow-2xl transition-all ${isMonitorMinimized ? 'w-12 h-12' : 'w-60 h-40'}`}>
        <div onMouseDown={() => setIsDraggingMonitor(true)} className="bg-zinc-900 h-5 flex items-center justify-between px-2 cursor-move text-[#f0b90b] text-[8px] font-black uppercase">
          {!isMonitorMinimized && <span>Feed_Vision</span>}
          <button onClick={() => setIsMonitorMinimized(!isMonitorMinimized)}>
            {isMonitorMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
        </div>
        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover grayscale opacity-70 ${isMonitorMinimized ? 'hidden' : ''}`} />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
      </main >
    </div >
  );
}