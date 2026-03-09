'use client';

import { useState, useEffect } from 'react';
import type { TimeFrame, CandleDirection } from '@/lib/types';

interface UseNikimaruAIProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: TimeFrame;
  candleDirection: CandleDirection;
}

export function useNikimaruAI({ currentPrice, isHuellaActive, timeframe, candleDirection }: UseNikimaruAIProps) {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Solo disparamos la IA si hay un precio real y huella activa
    if (isHuellaActive && currentPrice > 0) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              price: currentPrice,
              huella: isHuellaActive,
              tf: timeframe,
              direction: candleDirection
            }),
          });
          const data = await response.json();
          setAdvice(data.text);
        } catch (error) {
          console.error("Error en Nikimaru AI:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [isHuellaActive, timeframe]); // Se dispara cuando cambia la huella o el timeframe

  return { advice, isLoading };
}