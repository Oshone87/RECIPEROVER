import { TierCard } from "../TierCard";
import { ThemeProvider } from "../ThemeProvider";

export default function TierCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
        <TierCard
          tier="Silver"
          minimum={1000}
          apr={6}
          features={["BTC, ETH, USDC", "30-365 day terms", "Email support"]}
        />
        <TierCard
          tier="Gold"
          minimum={5000}
          apr={8}
          features={["All Silver features", "Priority support", "Advanced analytics"]}
          highlighted
        />
        <TierCard
          tier="Platinum"
          minimum={10000}
          apr={10}
          features={["All Gold features", "Dedicated manager", "Custom terms"]}
        />
      </div>
    </ThemeProvider>
  );
}
