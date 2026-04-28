import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

// Stock company logos (using first letter as icon)
const STOCK_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  TSLA: { bg: "bg-red-100 dark:bg-red-950/30", text: "text-red-600", accent: "border-red-200 dark:border-red-800" },
  AAPL: { bg: "bg-slate-100 dark:bg-slate-950/30", text: "text-slate-600", accent: "border-slate-200 dark:border-slate-800" },
  GOOGL: { bg: "bg-blue-100 dark:bg-blue-950/30", text: "text-blue-600", accent: "border-blue-200 dark:border-blue-800" },
  AMZN: { bg: "bg-orange-100 dark:bg-orange-950/30", text: "text-orange-600", accent: "border-orange-200 dark:border-orange-800" },
  MSFT: { bg: "bg-cyan-100 dark:bg-cyan-950/30", text: "text-cyan-600", accent: "border-cyan-200 dark:border-cyan-800" },
  NVDA: { bg: "bg-green-100 dark:bg-green-950/30", text: "text-green-600", accent: "border-green-200 dark:border-green-800" },
};

const STOCK_NAMES: Record<string, string> = {
  TSLA: "Tesla",
  AAPL: "Apple",
  GOOGL: "Google",
  AMZN: "Amazon",
  MSFT: "Microsoft",
  NVDA: "NVIDIA",
};

interface StockCardProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  onInvest?: () => void;
  showInvestButton?: boolean;
  compact?: boolean;
}

export function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  high,
  low,
  onInvest,
  showInvestButton = true,
  compact = false,
}: StockCardProps) {
  const colors = STOCK_COLORS[symbol] || STOCK_COLORS.TSLA;
  const displayName = name || STOCK_NAMES[symbol] || symbol;
  const isPositive = change >= 0;

  if (compact) {
    return (
      <Card className={`p-3 hover:shadow-md transition-all border ${colors.accent}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <span className={`text-sm font-bold ${colors.text}`}>{symbol[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{symbol}</p>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-sm">${price.toFixed(2)}</p>
            <p className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 hover:shadow-lg transition-all border ${colors.accent} hover-elevate`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <span className={`text-lg font-bold ${colors.text}`}>{symbol[0]}</span>
          </div>
          <div>
            <h3 className="font-bold text-base">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>
        </div>
        <Badge
          variant={isPositive ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono">${price.toFixed(2)}</span>
          <span className={`text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}${Math.abs(change).toFixed(2)}
          </span>
        </div>
        {high !== undefined && low !== undefined && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>H: ${high.toFixed(2)}</span>
            <span>L: ${low.toFixed(2)}</span>
          </div>
        )}
      </div>

      {showInvestButton && onInvest && (
        <Button
          onClick={onInvest}
          className="w-full"
          variant="default"
          size="sm"
        >
          Invest in {symbol}
        </Button>
      )}
    </Card>
  );
}
