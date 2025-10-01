import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TierCardProps {
  tier: string;
  minimum: number;
  apr: number;
  features: string[];
  highlighted?: boolean;
  onSelect?: () => void;
}

export function TierCard({ tier, minimum, apr, features, highlighted, onSelect }: TierCardProps) {
  const tierColors = {
    Silver: "from-slate-400 to-slate-600",
    Gold: "from-yellow-400 to-yellow-600",
    Platinum: "from-blue-400 to-blue-600",
  };

  return (
    <Card className={`p-8 relative overflow-hidden ${highlighted ? "ring-2 ring-primary shadow-xl shadow-primary/20" : ""}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors]}`} />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">{tier}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-muted-foreground">Min</span>
            <span className="text-3xl font-bold font-mono">${minimum.toLocaleString()}</span>
          </div>
        </div>

        <div className="py-4 border-y">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-chart-2 font-mono">{apr}%</span>
            <span className="text-muted-foreground">APR</span>
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          variant={highlighted ? "default" : "outline"} 
          className="w-full" 
          size="lg"
          onClick={() => onSelect?.()}
          data-testid={`button-start-${tier.toLowerCase()}`}
        >
          Start Investing
        </Button>
      </div>
    </Card>
  );
}
