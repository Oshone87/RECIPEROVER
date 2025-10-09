import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { TierCard } from "./TierCard";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TbCurrencySolana } from "react-icons/tb";
import { DollarSign, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvestment } from "@/contexts/InvestmentContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";

const TIERS = {
  silver: {
    label: "Silver",
    min: 1000,
    apr: 24.0, // 2400% APR - doubles money in 30 days
    features: ["BTC, ETH, SOL", "30-365 day terms", "Email support"],
  },
  gold: {
    label: "Gold",
    min: 5000,
    apr: 30.0, // 3000% APR - 2.5x money in 30 days
    features: ["All Silver features", "Priority support", "Advanced analytics"],
  },
  platinum: {
    label: "Platinum",
    min: 10000,
    apr: 36.0, // 3600% APR - 3x money in 30 days
    features: ["All Gold features", "Dedicated manager", "Custom terms"],
  },
};

const ASSETS = [
  {
    id: "BTC",
    name: "Bitcoin",
    icon: SiBitcoin,
    walletAddress: "3H2CW2w8eiCnytfF57Tyk4sxxZwbr9aQCx",
  },
  {
    id: "ETH",
    name: "Ethereum",
    icon: SiEthereum,
    walletAddress: "0x275CDF33a56400f3164AA34831027f7b5A42ABb4",
  },
  {
    id: "SOL",
    name: "Solana",
    icon: TbCurrencySolana,
    walletAddress: "8XoKp527ERexxMC9QxL4soXHRvwKdCj2wmNK3iBdNxVE",
  },
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
  const [walletCopied, setWalletCopied] = useState(false);
  const [showDepositStep, setShowDepositStep] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const { toast } = useToast();
  const {
    balance,
    createInvestment,
    getAvailableBalance,
    getAssetBalance,
    createDepositRequest,
  } = useInvestment();
  const { user } = useAuth();

  const selectedTier = TIERS[tier];
  const selectedAsset = ASSETS.find((a) => a.id === asset);
  const interest = amount * (selectedTier.apr / 365) * period;
  const total = amount + interest;
  const assetBalance = getAssetBalance(asset); // Get balance for specific asset
  const needsDeposit = amount > assetBalance; // Check against asset-specific balance

  const copyWalletAddress = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.walletAddress);
      setWalletCopied(true);
      toast({
        title: "Wallet Address Copied!",
        description:
          "Now send your funds to this address. Once payment is verified by admin, you can proceed with your investment.",
      });
    }
  };

  const handleDepositSubmit = () => {
    const depositAmount = amount - assetBalance; // Only deposit what's needed for this specific asset
    createDepositRequest(depositAmount, asset, transactionHash);

    toast({
      title: "Deposit Request Submitted",
      description: `Your deposit request for $${depositAmount.toLocaleString()} has been submitted. Please wait for admin approval before proceeding with investment.`,
    });

    onOpenChange(false);
    setStep(1);
    setWalletCopied(false);
    setTransactionHash("");
  };

  const getMaxStep = () => {
    return needsDeposit ? 6 : 5; // Add deposit step if needed
  };

  const getStepNumber = (currentStep: number) => {
    // If we need deposit, step 4 becomes deposit, step 5 becomes period, step 6 becomes summary
    // If we don't need deposit, step 4 becomes period, step 5 becomes summary
    if (needsDeposit) {
      return currentStep;
    } else {
      // Skip step 4 (deposit) if not needed
      return currentStep >= 4 ? currentStep + 1 : currentStep;
    }
  };

  const handleConfirm = async () => {
    // Check if user has sufficient balance in the specific asset
    if (amount > assetBalance) {
      toast({
        title: "Insufficient funds",
        description: `You only have $${assetBalance.toLocaleString()} in ${asset}. Please deposit more ${asset} first.`,
        variant: "destructive",
      });
      return;
    }

    // Create the investment directly
    const success = await createInvestment({
      tier: selectedTier.label,
      asset,
      amount,
      apr: selectedTier.apr * 100, // Convert to percentage
      period,
    });

    if (success) {
      toast({
        title: "Investment Created!",
        description: `Your ${
          selectedTier.label
        } investment of $${amount.toLocaleString()} in ${asset} has been created successfully!`,
      });
      onOpenChange(false);
      setStep(1);
      setWalletCopied(false);
      setTransactionHash("");
    } else {
      toast({
        title: "Investment Failed",
        description: "Unable to create investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Investment</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: getMaxStep() }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {getMaxStep()}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Investment Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(TIERS).map(([key, value]) => (
                  <div
                    key={key}
                    className={`cursor-pointer transition-all ${
                      tier === key ? "ring-2 ring-primary" : ""
                    }`}
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
              <h3 className="font-semibold">Choose Asset to Invest</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ASSETS.map((a) => {
                  const balance = getAssetBalance(a.id);
                  return (
                    <Card
                      key={a.id}
                      className={`p-6 cursor-pointer hover-elevate transition-all ${
                        asset === a.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => {
                        setAsset(a.id);
                        // Reset amount to minimum when asset changes
                        setAmount(selectedTier.min);
                      }}
                      data-testid={`card-asset-${a.id.toLowerCase()}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <a.icon className="h-10 w-10" />
                        <div className="text-center">
                          <span className="font-semibold block">{a.name}</span>
                          <span className="text-sm text-muted-foreground block mt-1">
                            Available: ${balance.toLocaleString()}
                          </span>
                          {balance === 0 && (
                            <span className="text-xs text-red-500 block mt-1">
                              No balance - deposit needed
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> You can only invest using the
                  cryptocurrency you select. Make sure you have sufficient
                  balance in that specific asset.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Enter Investment Amount</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Amount (USD)</Label>
                  <span className="text-sm text-muted-foreground">
                    Available in {asset}: ${assetBalance.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={selectedTier.min}
                  max={assetBalance}
                  data-testid="input-investment-amount"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Minimum: ${selectedTier.min.toLocaleString()}</span>
                  <span>Maximum: ${assetBalance.toLocaleString()}</span>
                </div>
                {needsDeposit && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Deposit Required:</strong> You need $
                      {(amount - assetBalance).toLocaleString()} more in {asset}{" "}
                      to proceed with this investment. You currently have $
                      {assetBalance.toLocaleString()} in {asset}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && needsDeposit && (
            <div className="space-y-6">
              <h3 className="font-semibold">Deposit Required</h3>
              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-4 mb-4">
                  {selectedAsset && <selectedAsset.icon className="h-8 w-8" />}
                  <div>
                    <h4 className="font-semibold">
                      Deposit ${(amount - assetBalance).toLocaleString()} in{" "}
                      {selectedAsset?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Send exactly ${(amount - assetBalance).toLocaleString()}{" "}
                      worth of {asset} to this address
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-sm font-mono break-all flex-1">
                        {selectedAsset?.walletAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyWalletAddress}
                        className="shrink-0"
                        data-testid="button-copy-wallet"
                      >
                        {walletCopied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction Hash (Optional)</Label>
                    <Input
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="Enter transaction hash to speed up verification"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                        Important Instructions:
                      </p>
                      <ul className="text-orange-700 dark:text-orange-300 space-y-1">
                        <li>
                          • Send exactly $
                          {(amount - assetBalance).toLocaleString()} worth of{" "}
                          {asset} to the provided address
                        </li>
                        <li>
                          • Double-check the wallet address before sending
                        </li>
                        <li>
                          • Your deposit will be reviewed by admin before
                          approval
                        </li>
                        <li>
                          • Once approved, you can complete your investment
                        </li>
                        <li>• Admin verification typically takes 1-24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === 4 && !needsDeposit && (
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
                    <span className="font-mono font-medium">
                      ${amount.toLocaleString()}
                    </span>
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
                    <span className="text-muted-foreground">
                      Estimated Interest:
                    </span>
                    <span className="font-mono font-bold text-chart-2">
                      ${interest.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Total:
                    </span>
                    <span className="font-mono font-bold text-xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === 5 && needsDeposit && (
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
                    <span className="font-mono font-medium">
                      ${amount.toLocaleString()}
                    </span>
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
                    <span className="text-muted-foreground">
                      Estimated Interest:
                    </span>
                    <span className="font-mono font-bold text-chart-2">
                      ${interest.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Total:
                    </span>
                    <span className="font-mono font-bold text-xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === 6 && needsDeposit && (
            <div className="space-y-6">
              <h3 className="font-semibold">Complete Deposit Request</h3>
              <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold mb-4">Deposit Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Deposit Amount:
                    </span>
                    <span className="font-mono font-medium">
                      ${(amount - assetBalance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="font-medium">{asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Investment Amount:
                    </span>
                    <span className="font-mono font-medium">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-yellow-600">
                      Pending Admin Approval
                    </span>
                  </div>
                </div>
              </Card>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Next Steps:</strong> Your deposit request will be
                  submitted for admin review. Once approved (typically 1-24
                  hours), the funds will be added to your balance and you can
                  complete your investment.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
            data-testid="button-modal-back"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => {
              const maxStep = getMaxStep();
              if (step < maxStep) {
                setStep(step + 1);
              } else {
                // Final step logic
                if (needsDeposit) {
                  handleDepositSubmit();
                } else {
                  handleConfirm();
                }
              }
            }}
            disabled={
              (step === 4 && needsDeposit && !walletCopied) ||
              (step === 3 && amount < selectedTier.min) ||
              (step === 3 && amount > assetBalance && !needsDeposit)
            }
            data-testid="button-modal-next"
          >
            {step === getMaxStep()
              ? needsDeposit
                ? "Submit Deposit Request"
                : "Confirm & Invest"
              : step === 4 && needsDeposit
              ? "I've Sent the Payment"
              : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
