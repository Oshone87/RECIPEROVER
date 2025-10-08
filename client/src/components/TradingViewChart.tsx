import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
}

export function TradingViewChart({
  symbol = "BINANCE:BTCUSDT",
  height = 400,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  const openTradingView = () => {
    const tradingViewSymbol = symbol.replace(":", "%3A");
    window.open(
      `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Live Market Data</h3>
          <p className="text-sm text-muted-foreground">
            Real-time cryptocurrency prices powered by TradingView
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openTradingView}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in TradingView
        </Button>
      </div>

      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="rounded-lg overflow-hidden border bg-white"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">
              Loading TradingView chart...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
