'use client';

import { useState, useEffect } from 'react';

export default function NikimaruApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ background: 'black', height: '100vh' }} />;

  return (
    <div style={{
      background: '#050505',
      color: '#ffd700',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      flexDirection: 'column'
    }}>
      <h1>NIKIMARU TERMINAL v1.0</h1>
      <p style={{ color: 'white' }}>Si ves esto, el motor de Next.js funciona.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ffd700' }}>
        STATUS: ONLINE
      </div>
    </div>
  );
}
