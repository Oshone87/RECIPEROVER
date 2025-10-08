import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TierCardProps {
  tier: string;
  minimum: number;
  apr: number;
  features: string[];
  highlighted?: boolean;
  onSelect?: () => void;
}

export function TierCard({
  tier,
  minimum,
  apr,
  features,
  highlighted,
  onSelect,
}: TierCardProps) {
  const tierColors = {
    Bronze: "from-amber-600 to-amber-800",
    Silver: "from-slate-400 to-slate-600",
    Gold: "from-yellow-400 to-yellow-600",
    Platinum: "from-blue-400 to-blue-600",
  };

  return (
    <Card
      className={`p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group ${
        highlighted ? "ring-2 ring-primary shadow-xl shadow-primary/20" : ""
      }`}
      onClick={() => onSelect?.()}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          tierColors[tier as keyof typeof tierColors]
        } group-hover:h-2 transition-all duration-300`}
      />

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            {tier}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Min
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono group-hover:text-primary transition-colors duration-300">
              ${minimum.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="py-3 sm:py-4 border-y">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-chart-2 font-mono group-hover:scale-110 transition-transform duration-300 inline-block">
              {apr}%
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">
              APR
            </span>
          </div>
        </div>

        <ul className="space-y-2 sm:space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
