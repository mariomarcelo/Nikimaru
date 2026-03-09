'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  CrosshairMode,
  PriceLineOptions,
} from 'lightweight-charts';
import { useBinanceWebSocket } from '@/hooks/use-binance-websocket';
import type { TimeFrame, Position, CandleDirection } from '@/lib/types';

interface TradingChartProps {
  timeframe: TimeFrame;
  isActive: boolean;
  position: Position | null;
  onPriceUpdate?: (price: number) => void;
  onHuellaChange?: (active: boolean) => void;
  onDirectionChange?: (direction: CandleDirection) => void;
  isRayoDorado: boolean;
  candleDirection: CandleDirection;
}

export function TradingChart({
  timeframe,
  isActive,
  position,
  onPriceUpdate,
  onHuellaChange,
  onDirectionChange,
  isRayoDorado = false,
  candleDirection: externalDirection, // Lo renombramos para que no choque con la del hook
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const entryLineRef = useRef<any>(null);
  const slLineRef = useRef<any>(null);
  const tpLineRef = useRef<any>(null);

  const {
    candles,
    volumes,
    currentPrice,
    emaValues,
    isHuellaActive,
    isConnected,
    candleDirection: internalDirection // Dirección calculada en tiempo real
  } = useBinanceWebSocket(timeframe, isActive);

  // Notificar al padre sobre actualizaciones de precio y estado
  useEffect(() => {
    if (currentPrice > 0 && onPriceUpdate) onPriceUpdate(currentPrice);
  }, [currentPrice, onPriceUpdate]);

  useEffect(() => {
    if (onHuellaChange) onHuellaChange(isHuellaActive);
  }, [isHuellaActive, onHuellaChange]);

  useEffect(() => {
    if (onDirectionChange) onDirectionChange(internalDirection);
  }, [internalDirection, onDirectionChange]);

  const initChart = useCallback(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: '#000000' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#171717' }, horzLines: { color: '#171717' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#262626' },
      timeScale: { borderColor: '#262626', timeVisible: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6', priceFormat: { type: 'volume' }, priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const emaSeries = chart.addLineSeries({
      color: '#eab308', lineWidth: 1, priceScaleId: '',
      lastValueVisible: false, priceLineVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    emaSeriesRef.current = emaSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isActive) {
      const cleanup = initChart();
      return () => {
        cleanup?.();
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    }
  }, [isActive, initChart]);

  // Actualización de Datos (Candles, Volume, EMA)
  useEffect(() => {
    if (candleSeriesRef.current && candles.length > 0) {
      candleSeriesRef.current.setData(candles as CandlestickData<Time>[]);
    }
  }, [candles]);

  useEffect(() => {
    if (volumeSeriesRef.current && volumes.length > 0) {
      volumeSeriesRef.current.setData(volumes as HistogramData<Time>[]);
    }
  }, [volumes]);

  useEffect(() => {
    if (emaSeriesRef.current && emaValues.length > 0 && volumes.length > 0) {
      const emaData = volumes.map((v, i) => ({
        time: v.time as Time,
        value: emaValues[i] || 0,
      }));
      emaSeriesRef.current.setData(emaData);
    }
  }, [emaValues, volumes]);

  // Dibujado de Líneas de Posición (Entry, SL, TP)
  useEffect(() => {
    const s = candleSeriesRef.current;
    if (!s) return;

    [entryLineRef, slLineRef, tpLineRef].forEach(ref => {
      if (ref.current) { s.removePriceLine(ref.current); ref.current = null; }
    });

    if (position) {
      entryLineRef.current = s.createPriceLine({
        price: position.entryPrice, color: '#eab308', lineWidth: 2, title: 'ENTRY'
      } as PriceLineOptions);

      slLineRef.current = s.createPriceLine({
        price: position.stopLoss, color: '#ef4444', lineWidth: 2,
        title: position.isBreakEven ? 'BE' : 'SL', lineStyle: position.isBreakEven ? 0 : 2
      } as PriceLineOptions);

      tpLineRef.current = s.createPriceLine({
        price: position.takeProfit, color: '#22c55e', lineWidth: 2, title: 'TP'
      } as PriceLineOptions);
    }
  }, [position]);

  if (!isActive) return null;

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* HUD de Información */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
            {isConnected ? 'Binance Live' : 'Offline'}
          </span>
        </div>
        <div className="text-xl font-black text-white italic">BTC/USDT</div>
      </div>

      <div className="absolute top-4 right-4 text-right pointer-events-none">
        <div className="text-2xl font-black text-yellow-400 tabular-nums">
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${isRayoDorado ? 'bg-yellow-400 text-black animate-pulse' : 'bg-zinc-800 text-zinc-400'
          }`}>
          {isRayoDorado ? '⚡ RAYO DORADO ACTIVO' : 'ESPERANDO HUELLA'}
        </div>
      </div>
    </div>
  );
}