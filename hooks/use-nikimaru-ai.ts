'use client';

import { useState, useEffect, useRef } from 'react';

interface NikimaruAIProps {
  currentPrice: number;
  isHuellaActive: boolean;
  timeframe: string;
  candleDirection: 'LONG' | 'SHORT' | 'NEUTRAL';
}

export function useNikimaruAI({
  currentPrice,
  isHuellaActive,
  timeframe,
  candleDirection
}: NikimaruAIProps) {
  const [advice, setAdvice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Evitamos llamadas infinitas: Solo una consulta por cada "bloque" de huella
  const lastAnalysisPrice = useRef<number>(0);
  const isAnalyzing = useRef<boolean>(false);

  const analyzeMarket = async () => {
    if (isAnalyzing.current) return;

    setIsLoading(true);
    isAnalyzing.current = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: currentPrice,
          huella: isHuellaActive,
          tf: timeframe,
          direction: candleDirection,
          // La API Key se maneja en el servidor (API Route) por seguridad
        }),
      });

      const data = await response.json();
      setAdvice(data.text || data.content);
    } catch (error) {
      console.error("Error en Nikimaru Brain:", error);
      setAdvice("Error de conexión con el foso de trading.");
    } finally {
      setIsLoading(false);
      isAnalyzing.current = false;
      lastAnalysisPrice.current = currentPrice;
    }
  };

  useEffect(() => {
    // DISPARADOR: Si hay Huella Activa y el precio se ha movido significativamente 
    // desde el último análisis, consultamos a la IA.
    const priceGap = Math.abs(currentPrice - lastAnalysisPrice.current);

    if (isHuellaActive && priceGap > (currentPrice * 0.0001)) {
      analyzeMarket();
    }
  }, [isHuellaActive, candleDirection]);

  return {
    advice,
    isLoading,
    analyzeManual: analyzeMarket // Por si quieres un botón de "Analizar Ahora"
  };
}