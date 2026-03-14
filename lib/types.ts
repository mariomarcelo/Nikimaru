export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: number;
  value: number;
  color: string;
}

export interface BinanceKline {
  t: number;      // Kline start time
  T: number;      // Kline close time
  s: string;      // Symbol
  i: string;      // Interval
  f: number;      // First trade ID
  L: number;      // Last trade ID
  o: string;      // Open price
  c: string;      // Close price
  h: string;      // High price
  l: string;      // Low price
  v: string;      // Base asset volume
  n: number;      // Number of trades
  x: boolean;     // Is this kline closed?
  q: string;      // Quote asset volume
  V: string;      // Taker buy base asset volume
  Q: string;      // Taker buy quote asset volume
  B: string;      // Ignore
}

export interface TradeConfig {
  capital: number;
  leverage: number;
  stopLossPrice: number | null;
  entryPrice: number | null;
  takeProfitPrice: number | null;
  maxLoss: number;
  commission: number;
}

export interface Position {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  side: 'LONG' | 'SHORT';
  isBreakEven: boolean;
}

export type TimeFrame = '1m' | '15m' | '1h';

// Candle direction for directional illumination
export type CandleDirection = 'LONG' | 'SHORT' | 'NEUTRAL';

export interface ChartMessage {
  role: 'user' | 'assistant';
  content: string;
}
