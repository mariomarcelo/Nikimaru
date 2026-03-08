'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { CandleData, VolumeData, BinanceKline, TimeFrame, CandleDirection } from '@/lib/types';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';
const BINANCE_REST_BASE = 'https://api.binance.com/api/v3';

const INTERVAL_MAP: Record<TimeFrame, string> = {
  '1m': '1m',
  '15m': '15m',
  '1h': '1h',
};

interface UseBinanceWebSocketReturn {
  candles: CandleData[];
  volumes: VolumeData[];
  currentPrice: number;
  emaValues: number[];
  isHuellaActive: boolean;
  isConnected: boolean;
  candleDirection: CandleDirection;
}

export function useBinanceWebSocket(
  timeframe: TimeFrame,
  isActive: boolean
): UseBinanceWebSocketReturn {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [emaValues, setEmaValues] = useState<number[]>([]);
  const [isHuellaActive, setIsHuellaActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [candleDirection, setCandleDirection] = useState<CandleDirection>('NEUTRAL');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate EMA for volume
  const calculateEMA = useCallback((data: number[], period: number): number[] => {
    if (data.length === 0) return [];
    
    const k = 2 / (period + 1);
    const ema: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    
    return ema;
  }, []);

  // Determine candle direction (LONG/SHORT/NEUTRAL based on body)
  const getCandleDirection = useCallback((candle: CandleData): CandleDirection => {
    const bodySize = Math.abs(candle.close - candle.open);
    const totalRange = candle.high - candle.low;
    
    // If body is less than 10% of total range, it's a doji (NEUTRAL)
    if (totalRange > 0 && bodySize / totalRange < 0.1) {
      return 'NEUTRAL';
    }
    
    // Bullish candle (close > open) = LONG
    if (candle.close > candle.open) {
      return 'LONG';
    }
    
    // Bearish candle (close < open) = SHORT
    if (candle.close < candle.open) {
      return 'SHORT';
    }
    
    return 'NEUTRAL';
  }, []);

  // Fetch historical klines
  const fetchHistoricalData = useCallback(async () => {
    try {
      const interval = INTERVAL_MAP[timeframe];
      const response = await fetch(
        `${BINANCE_REST_BASE}/klines?symbol=BTCUSDT&interval=${interval}&limit=100`
      );
      
      if (!response.ok) throw new Error('Failed to fetch historical data');
      
      const data = await response.json();
      
      const historicalCandles: CandleData[] = data.map((kline: string[]) => ({
        time: Math.floor(Number(kline[0]) / 1000),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
      }));

      const historicalVolumes: VolumeData[] = data.map((kline: string[]) => ({
        time: Math.floor(Number(kline[0]) / 1000),
        value: parseFloat(kline[5]),
        color: parseFloat(kline[4]) >= parseFloat(kline[1]) 
          ? 'rgba(0, 200, 83, 0.5)' 
          : 'rgba(220, 20, 60, 0.5)',
      }));

      setCandles(historicalCandles);
      setVolumes(historicalVolumes);
      
      if (historicalCandles.length > 0) {
        setCurrentPrice(historicalCandles[historicalCandles.length - 1].close);
      }

      // Calculate EMA for volumes
      const volumeValues = historicalVolumes.map(v => v.value);
      const ema = calculateEMA(volumeValues, 20);
      setEmaValues(ema);

      // Check if current volume > EMA
      if (volumeValues.length > 0 && ema.length > 0) {
        const lastVolume = volumeValues[volumeValues.length - 1];
        const lastEma = ema[ema.length - 1];
        setIsHuellaActive(lastVolume > lastEma);
      }

      // Set candle direction from last candle
      if (historicalCandles.length > 0) {
        const lastCandle = historicalCandles[historicalCandles.length - 1];
        setCandleDirection(getCandleDirection(lastCandle));
      }

    } catch (error) {
      console.error('[v0] Error fetching historical data:', error);
    }
  }, [timeframe, calculateEMA, getCandleDirection]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isActive) return;
    
    const interval = INTERVAL_MAP[timeframe];
    const wsUrl = `${BINANCE_WS_BASE}/btcusdt@kline_${interval}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[v0] Binance WebSocket connected:', timeframe);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const kline: BinanceKline = data.k;
        
        const newCandle: CandleData = {
          time: Math.floor(kline.t / 1000),
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        const newVolume: VolumeData = {
          time: Math.floor(kline.t / 1000),
          value: parseFloat(kline.v),
          color: parseFloat(kline.c) >= parseFloat(kline.o) 
            ? 'rgba(0, 200, 83, 0.5)' 
            : 'rgba(220, 20, 60, 0.5)',
        };

        setCurrentPrice(newCandle.close);
        
        // Update candle direction
        setCandleDirection(getCandleDirection(newCandle));

        setCandles(prev => {
          const updated = [...prev];
          const lastIndex = updated.findIndex(c => c.time === newCandle.time);
          
          if (lastIndex >= 0) {
            updated[lastIndex] = newCandle;
          } else {
            updated.push(newCandle);
            // Keep only last 100 candles for performance
            if (updated.length > 100) {
              updated.shift();
            }
          }
          return updated;
        });

        setVolumes(prev => {
          const updated = [...prev];
          const lastIndex = updated.findIndex(v => v.time === newVolume.time);
          
          if (lastIndex >= 0) {
            updated[lastIndex] = newVolume;
          } else {
            updated.push(newVolume);
            if (updated.length > 100) {
              updated.shift();
            }
          }
          
          // Recalculate EMA
          const volumeValues = updated.map(v => v.value);
          const ema = calculateEMA(volumeValues, 20);
          setEmaValues(ema);
          
          // Check HUELLA
          if (volumeValues.length > 0 && ema.length > 0) {
            const lastVolume = volumeValues[volumeValues.length - 1];
            const lastEma = ema[ema.length - 1];
            setIsHuellaActive(lastVolume > lastEma);
          }
          
          return updated;
        });

      } catch (error) {
        console.error('[v0] Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[v0] WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[v0] WebSocket closed, reconnecting...');
      setIsConnected(false);
      
      // Fast reconnect for 1M (instant updates), slower for others
      const reconnectDelay = timeframe === '1m' ? 500 : 2000;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isActive) {
          connect();
        }
      }, reconnectDelay);
    };

  }, [timeframe, isActive, calculateEMA]);

  // Effect for connection management - optimized for instant 1M switching
  useEffect(() => {
    if (isActive) {
      // Clear previous state immediately for fresh load
      setCandles([]);
      setVolumes([]);
      setEmaValues([]);
      
      // Fetch historical data and connect WebSocket in parallel
      fetchHistoricalData();
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isActive, timeframe, fetchHistoricalData, connect]);

  return {
    candles,
    volumes,
    currentPrice,
    emaValues,
    isHuellaActive,
    isConnected,
    candleDirection,
  };
}
