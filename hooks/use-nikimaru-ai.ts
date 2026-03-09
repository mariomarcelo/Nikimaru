import { useState, useEffect, useRef } from 'react';
import { TimeFrame, CandleDirection } from '@/lib/types';

export function useNikimaruAI({
  currentPrice,
  isHuellaActive,
  timeframe,
  candleDirection
}: {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: TimeFrame;
  candleDirection: CandleDirection;
}) {
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isHuellaActive && currentPrice > 0) {
      // Solo dispara la IA si hay huella real
      const getAnalysis = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ price: currentPrice, huella: isHuellaActive, tf: timeframe, direction: candleDirection })
          });
          const data = await res.json();
          setAdvice(data.text);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      getAnalysis();
    }
  }, [isHuellaActive]);

  return { advice, isLoading };
}