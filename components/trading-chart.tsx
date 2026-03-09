'use client';

import { useEffect, useRef } from 'react';

export function TradingChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (container.current && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": "BINANCE:BTCUSDT",
          "interval": "1",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "es",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "container_id": "tv_chart_container",
        });
      }
    };
    container.current?.appendChild(script);
  }, []);

  return (
    <div className="w-full h-full border border-zinc-800 rounded-xl overflow-hidden bg-black">
      <div id="tv_chart_container" ref={container} className="h-full w-full" />
    </div>
  );
}