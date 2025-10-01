import { CryptoChart } from "../CryptoChart";
import { ThemeProvider } from "../ThemeProvider";

export default function CryptoChartExample() {
  return (
    <ThemeProvider>
      <div className="p-8 bg-background">
        <CryptoChart asset="BTC" height={400} />
      </div>
    </ThemeProvider>
  );
}
