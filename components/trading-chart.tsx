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
  isHuellaActive?: boolean;
  onHuellaChange?: (active: boolean) => void;
  onDirectionChange?: (direction: CandleDirection) => void;
  isRayoDorado?: boolean;
  candleDirection?: CandleDirection;
}

export function TradingChart({
  timeframe,
  isActive,
  position,
  onPriceUpdate,
  onHuellaChange,
  onDirectionChange,
  isRayoDorado = false,
  candleDirection: externalDirection,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const entryLineRef = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> | null>(null);
  const slLineRef = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> | null>(null);
  const tpLineRef = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> | null>(null);

  const { 
    candles, 
    volumes, 
    currentPrice, 
    emaValues, 
    isHuellaActive,
    isConnected,
    candleDirection
  } = useBinanceWebSocket(timeframe, isActive);

  // Notify parent of price updates
  useEffect(() => {
    if (currentPrice > 0 && onPriceUpdate) {
      onPriceUpdate(currentPrice);
    }
  }, [currentPrice, onPriceUpdate]);

  // Notify parent of HUELLA status
  useEffect(() => {
    if (onHuellaChange) {
      onHuellaChange(isHuellaActive);
    }
  }, [isHuellaActive, onHuellaChange]);

  // Notify parent of candle direction
  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange(candleDirection);
    }
  }, [candleDirection, onDirectionChange]);

  // Initialize chart
  const initChart = useCallback(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#000000' },
        textColor: '#e5e5e5',
        fontFamily: 'Roboto Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(38, 38, 38, 0.5)' },
        horzLines: { color: 'rgba(38, 38, 38, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#ffd700',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ffd700',
        },
        horzLine: {
          color: '#ffd700',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ffd700',
        },
      },
      rightPriceScale: {
        borderColor: '#262626',
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      },
      timeScale: {
        borderColor: '#262626',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c853',
      downColor: '#dc143c',
      borderUpColor: '#00c853',
      borderDownColor: '#dc143c',
      wickUpColor: '#00c853',
      wickDownColor: '#dc143c',
    });

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // EMA line series for volume
    const emaSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      priceScaleId: '',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    emaSeriesRef.current = emaSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Initialize chart on mount
  useEffect(() => {
    if (isActive) {
      const cleanup = initChart();
      return () => {
        cleanup?.();
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          candleSeriesRef.current = null;
          volumeSeriesRef.current = null;
          emaSeriesRef.current = null;
        }
      };
    }
  }, [isActive, initChart]);

  // Update candle data
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    const chartCandles: CandlestickData<Time>[] = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeriesRef.current.setData(chartCandles);
  }, [candles]);

  // Update volume data
  useEffect(() => {
    if (!volumeSeriesRef.current || volumes.length === 0) return;

    const chartVolumes: HistogramData<Time>[] = volumes.map(v => ({
      time: v.time as Time,
      value: v.value,
      color: v.color,
    }));

    volumeSeriesRef.current.setData(chartVolumes);
  }, [volumes]);

  // Update EMA data
  useEffect(() => {
    if (!emaSeriesRef.current || emaValues.length === 0 || volumes.length === 0) return;

    const emaData: LineData<Time>[] = volumes.map((v, i) => ({
      time: v.time as Time,
      value: emaValues[i] || 0,
    }));

    emaSeriesRef.current.setData(emaData);
  }, [emaValues, volumes]);

  // Update position lines
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    // Remove existing lines
    if (entryLineRef.current) {
      candleSeriesRef.current.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }
    if (slLineRef.current) {
      candleSeriesRef.current.removePriceLine(slLineRef.current);
      slLineRef.current = null;
    }
    if (tpLineRef.current) {
      candleSeriesRef.current.removePriceLine(tpLineRef.current);
      tpLineRef.current = null;
    }

    if (position) {
      // Entry line (Gold)
      const entryOptions: PriceLineOptions = {
        price: position.entryPrice,
        color: '#ffd700',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'ENTRY',
        lineVisible: true,
      };
      entryLineRef.current = candleSeriesRef.current.createPriceLine(entryOptions);

      // Stop Loss line (Red)
      const slOptions: PriceLineOptions = {
        price: position.stopLoss,
        color: '#dc143c',
        lineWidth: 2,
        lineStyle: position.isBreakEven ? 0 : 2,
        axisLabelVisible: true,
        title: position.isBreakEven ? 'BE' : 'SL',
        lineVisible: true,
      };
      slLineRef.current = candleSeriesRef.current.createPriceLine(slOptions);

      // Take Profit line (Green)
      const tpOptions: PriceLineOptions = {
        price: position.takeProfit,
        color: '#00c853',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'TP',
        lineVisible: true,
      };
      tpLineRef.current = candleSeriesRef.current.createPriceLine(tpOptions);
    }
  }, [position]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full"
      />
      
      {/* Connection status */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-bull' : 'bg-bear'
          }`}
        />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'LIVE' : 'CONNECTING...'}
        </span>
      </div>

      {/* Current price */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">BTC/USDT</span>
        <span className="text-sm font-bold text-gold">
          ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* HUELLA indicator - shows directional RAYO on 1M when volume > EMA */}
      <div 
        className={`absolute top-10 right-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
          isRayoDorado && candleDirection === 'LONG'
            ? 'bg-bull/30 text-bull border border-bull/50 shadow-lg shadow-bull/30'
            : isRayoDorado && candleDirection === 'SHORT'
            ? 'bg-bear/30 text-bear border border-bear/50 shadow-lg shadow-bear/30'
            : isRayoDorado && candleDirection === 'NEUTRAL'
            ? 'bg-gold/30 text-gold animate-pulse-gold border border-gold/50'
            : isHuellaActive 
            ? 'bg-gold/20 text-gold animate-glow-gold' 
            : 'bg-secondary text-muted-foreground'
        }`}
      >
        {isRayoDorado && candleDirection === 'LONG' ? 'HUNT LONG' 
          : isRayoDorado && candleDirection === 'SHORT' ? 'HUNT SHORT'
          : isRayoDorado && candleDirection === 'NEUTRAL' ? 'ESPERANDO CONFIRMACION'
          : `HUELLA ${isHuellaActive ? 'ACTIVE' : 'INACTIVE'}`}
      </div>
      
      {/* Timeframe context label */}
      <div className="absolute top-10 left-2 px-2 py-1 rounded text-xs text-muted-foreground bg-secondary/50">
        {timeframe === '1h' ? 'TENDENCIA MAYOR (EMA 20)' : 
         timeframe === '1m' ? 'SENAL DEFINITIVA (EMA 20)' : 
         'INTERMEDIO (EMA 20)'}
      </div>
    </div>
  );
}
