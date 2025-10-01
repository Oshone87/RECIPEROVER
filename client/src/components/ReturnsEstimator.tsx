import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const TIERS = {
  silver: { label: "Silver", min: 1000, apr: 0.06 },
  gold: { label: "Gold", min: 5000, apr: 0.08 },
  platinum: { label: "Platinum", min: 10000, apr: 0.10 },
};

export function ReturnsEstimator() {
  const [tier, setTier] = useState<keyof typeof TIERS>("silver");
  const [amount, setAmount] = useState(TIERS.silver.min);
  const [days, setDays] = useState(90);

  const { interest, total } = useMemo(() => {
    const apr = TIERS[tier].apr;
    const p = Number(amount) || 0;
    const i = p * (apr / 365) * Number(days);
    return { interest: i, total: p + i };
  }, [tier, amount, days]);

  const handleTierChange = (value: string) => {
    const newTier = value as keyof typeof TIERS;
    setTier(newTier);
    setAmount(TIERS[newTier].min);
  };

  return (
    <Card className="p-6 max-w-md">
      <h3 className="text-xl font-bold mb-6">Investment Estimator</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tier-select">Tier</Label>
          <Select value={tier} onValueChange={handleTierChange}>
            <SelectTrigger id="tier-select" data-testid="select-tier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIERS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label} (Min ${value.min.toLocaleString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-input">Amount (USD)</Label>
          <Input
            id="amount-input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={TIERS[tier].min}
            data-testid="input-amount"
          />
        </div>

        <div className="space-y-2">
          <Label>Period: {days} days</Label>
          <Slider
            value={[days]}
            onValueChange={([value]) => setDays(value)}
            min={30}
            max={365}
            step={1}
            data-testid="slider-period"
          />
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Estimated Interest:</span>
            <span className="text-2xl font-bold font-mono text-chart-2" data-testid="text-interest">
              ${interest.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Estimated Total:</span>
            <span className="text-3xl font-bold font-mono" data-testid="text-total">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
