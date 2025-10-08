import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradingViewChart } from "@/components/TradingViewChart";

interface CryptoSymbol {
  label: string;
  symbol: string;
  color: string;
}

const CRYPTO_SYMBOLS: CryptoSymbol[] = [
  { label: "BTC", symbol: "BINANCE:BTCUSDT", color: "text-orange-500" },
  { label: "ETH", symbol: "BINANCE:ETHUSDT", color: "text-blue-500" },
  { label: "USDC", symbol: "BINANCE:USDCUSDT", color: "text-green-500" },
  { label: "ADA", symbol: "BINANCE:ADAUSDT", color: "text-blue-600" },
  { label: "SOL", symbol: "BINANCE:SOLUSDT", color: "text-purple-500" },
];

export function LiveTradingChart() {
  const [selectedSymbol, setSelectedSymbol] = useState(CRYPTO_SYMBOLS[0]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Live Market Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Real-time cryptocurrency charts and market data
            </p>
          </div>

          <Tabs
            value={selectedSymbol.symbol}
            onValueChange={(value) => {
              const symbol = CRYPTO_SYMBOLS.find((s) => s.symbol === value);
              if (symbol) setSelectedSymbol(symbol);
            }}
          >
            <TabsList className="grid grid-cols-5 w-full sm:w-auto">
              {CRYPTO_SYMBOLS.map((crypto) => (
                <TabsTrigger
                  key={crypto.symbol}
                  value={crypto.symbol}
                  className={`text-xs sm:text-sm font-semibold ${crypto.color}`}
                >
                  {crypto.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <TradingViewChart symbol={selectedSymbol.symbol} height={400} />

        <div className="text-xs text-muted-foreground text-center border-t pt-4">
          <p>
            Market data provided by{" "}
            <a
              href="https://www.tradingview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TradingView
            </a>{" "}
            • Click "Open in TradingView" for advanced features and analysis
            tools
          </p>
        </div>
      </div>
    </Card>
  );
}
