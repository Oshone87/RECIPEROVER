import { useEffect, useRef } from "react";

interface CryptoChartProps {
  asset?: "BTC" | "ETH" | "USDT";
  height?: number;
}

export function CryptoChart({ asset = "BTC", height = 400 }: CryptoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const basePrice = asset === "BTC" ? 45000 : asset === "ETH" ? 2500 : 1;
    const points: number[] = [];
    let price = basePrice;

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * basePrice * 0.03;
      price += change;
      points.push(price);
    }

    const minPrice = Math.min(...points);
    const maxPrice = Math.max(...points);
    const priceRange = maxPrice - minPrice;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((price, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 40) - 20;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.lineTo(width, chartHeight);
    ctx.lineTo(0, chartHeight);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px monospace";
    ctx.fillText(`${asset}/USD`, 10, 20);
    ctx.fillText(`$${points[points.length - 1].toFixed(2)}`, 10, 40);
  }, [asset, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px` }}
      data-testid={`chart-${asset.toLowerCase()}`}
    />
  );
}
