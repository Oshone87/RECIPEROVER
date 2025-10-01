import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { TierCard } from "./TierCard";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIERS = {
  silver: { label: "Silver", min: 1000, apr: 0.06, features: ["BTC, ETH, USDC", "30-365 day terms", "Email support"] },
  gold: { label: "Gold", min: 5000, apr: 0.08, features: ["All Silver features", "Priority support", "Advanced analytics"] },
  platinum: { label: "Platinum", min: 10000, apr: 0.10, features: ["All Gold features", "Dedicated manager", "Custom terms"] },
};

const ASSETS = [
  { id: "BTC", name: "Bitcoin", icon: SiBitcoin },
  { id: "ETH", name: "Ethereum", icon: SiEthereum },
  { id: "USDC", name: "USD Coin", icon: DollarSign },
];

interface InvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentModal({ open, onOpenChange }: InvestmentModalProps) {
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<keyof typeof TIERS>("gold");
  const [amount, setAmount] = useState(5000);
  const [asset, setAsset] = useState("BTC");
  const [period, setPeriod] = useState(90);
  const { toast } = useToast();

  const selectedTier = TIERS[tier];
  const interest = amount * (selectedTier.apr / 365) * period;
  const total = amount + interest;

  const handleConfirm = () => {
    toast({
      title: "Investment Created!",
      description: `Your ${selectedTier.label} investment of $${amount.toLocaleString()} in ${asset} has been created.`,
    });
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Investment</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Step {step} of 4</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Investment Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(TIERS).map(([key, value]) => (
                  <div 
                    key={key} 
                    className={`cursor-pointer transition-all ${tier === key ? "ring-2 ring-primary" : ""}`}
                    onClick={() => {
                      setTier(key as keyof typeof TIERS);
                      setAmount(value.min);
                    }}
                  >
                    <TierCard
                      tier={value.label}
                      minimum={value.min}
                      apr={value.apr * 100}
                      features={value.features}
                      highlighted={tier === key}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Enter Investment Amount</h3>
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={selectedTier.min}
                  data-testid="input-investment-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum: ${selectedTier.min.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Choose Asset</h3>
              <div className="grid grid-cols-3 gap-4">
                {ASSETS.map((a) => (
                  <Card
                    key={a.id}
                    className={`p-6 cursor-pointer hover-elevate ${asset === a.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setAsset(a.id)}
                    data-testid={`card-asset-${a.id.toLowerCase()}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <a.icon className="h-10 w-10" />
                      <span className="font-semibold">{a.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Select Period</h3>
                <div className="space-y-2">
                  <Label>Period: {period} days</Label>
                  <Slider
                    value={[period]}
                    onValueChange={([value]) => setPeriod(value)}
                    min={30}
                    max={365}
                    step={1}
                    data-testid="slider-investment-period"
                  />
                </div>
              </div>

              <Card className="p-6 bg-muted/50">
                <h4 className="font-semibold mb-4">Investment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className="font-medium">{selectedTier.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-mono font-medium">${amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="font-medium">{asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">{period} days</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Estimated Interest:</span>
                    <span className="font-mono font-bold text-chart-2">${interest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Total:</span>
                    <span className="font-mono font-bold text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            data-testid="button-modal-back"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => step < 4 ? setStep(step + 1) : handleConfirm()}
            data-testid="button-modal-next"
          >
            {step === 4 ? "Confirm & Invest" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
