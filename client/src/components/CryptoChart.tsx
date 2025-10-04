import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CryptoChartProps {
  asset?: "BTC" | "ETH" | "USDT" | "ADA" | "SOL";
  height?: number;
  showCarousel?: boolean;
}

const CHART_ASSETS = [
  { id: "BTC", name: "Bitcoin", symbol: "BTC/USD" },
  { id: "ETH", name: "Ethereum", symbol: "ETH/USD" },
  { id: "USDT", name: "Tether", symbol: "USDT/USD" },
  { id: "ADA", name: "Cardano", symbol: "ADA/USD" },
  { id: "SOL", name: "Solana", symbol: "SOL/USD" },
] as const;

export function CryptoChart({
  asset = "BTC",
  height = 400,
  showCarousel = false,
}: CryptoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentAsset(asset);
    const index = CHART_ASSETS.findIndex((a) => a.id === asset);
    setCurrentIndex(index >= 0 ? index : 0);
  }, [asset]);

  const nextChart = () => {
    const nextIndex = (currentIndex + 1) % CHART_ASSETS.length;
    setCurrentIndex(nextIndex);
    setCurrentAsset(CHART_ASSETS[nextIndex].id as "BTC" | "ETH" | "USDT");
  };

  const prevChart = () => {
    const prevIndex =
      (currentIndex - 1 + CHART_ASSETS.length) % CHART_ASSETS.length;
    setCurrentIndex(prevIndex);
    setCurrentAsset(CHART_ASSETS[prevIndex].id as "BTC" | "ETH" | "USDT");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;

    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, chartHeight);

    const getBasePrice = (assetType: string) => {
      switch (assetType) {
        case "BTC":
          return 45000;
        case "ETH":
          return 2500;
        case "USDT":
          return 1;
        case "ADA":
          return 0.35;
        case "SOL":
          return 140;
        default:
          return 1;
      }
    };

    const basePrice = getBasePrice(currentAsset);
    const points: number[] = [];
    let price = basePrice;

    for (let i = 0; i < 100; i++) {
      const volatility = currentAsset === "USDT" ? 0.001 : 0.03;
      const change = (Math.random() - 0.5) * basePrice * volatility;
      price += change;
      points.push(price);
    }

    const minPrice = Math.min(...points);
    const maxPrice = Math.max(...points);
    const priceRange = maxPrice - minPrice;

    // Chart color based on asset
    const getChartColor = (assetType: string) => {
      switch (assetType) {
        case "BTC":
          return "#f7931a";
        case "ETH":
          return "#627eea";
        case "USDT":
          return "#26a17b";
        case "ADA":
          return "#0033ad";
        case "SOL":
          return "#00d4ff";
        default:
          return "#3b82f6";
      }
    };

    const chartColor = getChartColor(currentAsset);

    ctx.strokeStyle = chartColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((price, i) => {
      const x = (i / (points.length - 1)) * width;
      const y =
        chartHeight -
        ((price - minPrice) / priceRange) * (chartHeight - 40) -
        20;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = chartColor + "20";
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Asset label and price
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px monospace";
    const currentAssetData = CHART_ASSETS.find((a) => a.id === currentAsset);
    ctx.fillText(currentAssetData?.symbol || `${currentAsset}/USD`, 10, 20);

    const displayPrice =
      currentAsset === "USDT" || currentAsset === "ADA"
        ? points[points.length - 1].toFixed(4)
        : points[points.length - 1].toFixed(2);
    ctx.fillText(`$${displayPrice}`, 10, 40);
  }, [currentAsset, height]);

  if (showCarousel) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              {CHART_ASSETS[currentIndex]?.name} Chart
            </h3>
            <div className="flex items-center gap-2">
              {CHART_ASSETS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevChart}
              data-testid="chart-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextChart}
              data-testid="chart-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: `${height}px` }}
          data-testid={`chart-${currentAsset.toLowerCase()}`}
          className="rounded-lg"
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px` }}
      data-testid={`chart-${currentAsset.toLowerCase()}`}
    />
  );
}
