'use client';

import React, { useState } from 'react';

export function NikimaruChat() {
  const [input, setInput] = useState('');

  return (
    <div style={{ padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #d4af37', borderRadius: '8px', color: 'white', fontFamily: 'monospace' }}>
      <div style={{ fontSize: '12px', marginBottom: '10px', color: '#d4af37' }}>
        [NIKIMARU CORE v1.0]
      </div>
      <div style={{ height: '150px', overflowY: 'auto', fontSize: '11px', borderBottom: '1px solid #333', marginBottom: '10px' }}>
        Esperando conexión real...
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '11px' }}
          placeholder="Escribe aquí..."
        />
        <button style={{ color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer' }}>➔</button>
      </div>
    </div>
  );
}