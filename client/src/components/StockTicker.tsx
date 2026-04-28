import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockTicker() {
  const [stocks, setStocks] = useState<StockPrice[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await apiClient.getStockPrices();
        setStocks(data.stocks || []);
      } catch (err) {
        console.error("Failed to fetch stock prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (stocks.length === 0) return null;

  // Duplicate for seamless scroll
  const items = [...stocks, ...stocks];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden py-3 border-y border-slate-700/50">
      <div className="flex animate-scroll-stock gap-8 whitespace-nowrap">
        {items.map((stock, idx) => (
          <div
            key={`${stock.symbol}-${idx}`}
            className="flex items-center gap-3 px-4 shrink-0"
          >
            <span className="font-bold text-sm tracking-wide text-slate-300">
              {stock.symbol}
            </span>
            <span className="font-mono text-sm font-semibold">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                stock.change >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {stock.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stock.change >= 0 ? "+" : ""}
              {stock.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll-stock {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-stock {
          animation: scroll-stock 30s linear infinite;
        }
        .animate-scroll-stock:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
