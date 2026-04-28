import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FixedDurationSelector from "@/components/FixedDurationSelector";
import { Card } from "@/components/ui/card";
import { TierCard } from "./TierCard";
import { StockCard } from "./StockCard";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TbCurrencySolana } from "react-icons/tb";
import { Copy, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvestment } from "@/contexts/InvestmentContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

const TIERS = {
  silver: {
    label: "Silver",
    min: 1000,
    apr: 24.0,
    features: ["All stocks supported", "30-365 day terms", "Email support"],
  },
  gold: {
    label: "Gold",
    min: 5000,
    apr: 30.0,
    features: ["All Silver features", "Priority support", "Advanced analytics"],
  },
  platinum: {
    label: "Platinum",
    min: 10000,
    apr: 36.0,
    features: ["All Gold features", "Dedicated manager", "Custom terms"],
  },
};

const STOCK_LIST = [
  { id: "TSLA", name: "Tesla Inc." },
  { id: "AAPL", name: "Apple Inc." },
  { id: "GOOGL", name: "Alphabet Inc." },
  { id: "AMZN", name: "Amazon.com Inc." },
  { id: "MSFT", name: "Microsoft Corp." },
  { id: "NVDA", name: "NVIDIA Corp." },
];

// Payment is always via crypto
const DEPOSIT_ASSETS = [
  {
    id: "BTC",
    name: "Bitcoin",
    icon: SiBitcoin,
    walletAddress: "bc1qmydk975vecj4z9t649sx8l38nyttx06jnndcqu",
  },
  {
    id: "ETH",
    name: "Ethereum",
    icon: SiEthereum,
    walletAddress: "0xb551128346F1795AF6eF972137B76059F88DfD2B",
  },
  {
    id: "SOL",
    name: "Solana",
    icon: TbCurrencySolana,
    walletAddress: "4H95xEuCtH6T5RvnnqAc1ZdpeEewGKjYxqWw9VHswfzS",
  },
];

interface StockInvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedStock?: string;
}

export function StockInvestmentModal({
  open,
  onOpenChange,
  preselectedStock,
}: StockInvestmentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedStock, setSelectedStock] = useState(preselectedStock || "TSLA");
  const [tier, setTier] = useState<keyof typeof TIERS>("gold");
  const [amount, setAmount] = useState(5000);
  const [period, setPeriod] = useState(30);
  const [hasSelectedPeriod, setHasSelectedPeriod] = useState(false);
  const [depositAsset, setDepositAsset] = useState("BTC");
  const [walletCopied, setWalletCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [stockPrices, setStockPrices] = useState<any[]>([]);
  const { toast } = useToast();
  const {
    createInvestment,
    getAssetBalance,
    createDepositRequest,
  } = useInvestment();
  const { user } = useAuth();

  const selectedTier = TIERS[tier];
  const interest = amount * (selectedTier.apr / 365) * period;
  const total = amount + interest;
  const stockBalance = getAssetBalance(selectedStock);
  const needsDeposit = amount > stockBalance;
  const isKYCVerified = user?.isVerified || false;

  const selectedDepositAsset = DEPOSIT_ASSETS.find((a) => a.id === depositAsset);

  // Fetch stock prices when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const data = await apiClient.getStockPrices();
        setStockPrices(data.stocks || []);
      } catch (e) {
        console.error("Failed to fetch stock prices:", e);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (preselectedStock) setSelectedStock(preselectedStock);
  }, [preselectedStock]);

  const copyWalletAddress = () => {
    if (selectedDepositAsset) {
      navigator.clipboard.writeText(selectedDepositAsset.walletAddress);
      setWalletCopied(true);
      toast({
        title: "Wallet Address Copied!",
        description: "Send your crypto payment to this address to fund your stock investment.",
      });
    }
  };

  const handleDepositSubmit = () => {
    const depositAmount = amount - stockBalance;
    createDepositRequest(depositAmount, selectedStock, transactionHash);

    toast({
      title: "Deposit Request Submitted",
      description: `Your deposit request for $${depositAmount.toLocaleString()} for ${selectedStock} stock investment has been submitted. Please wait for admin approval.`,
    });

    onOpenChange(false);
    resetModal();
  };

  const handleConfirm = async () => {
    if (amount > stockBalance) {
      toast({
        title: "Insufficient funds",
        description: `You only have $${stockBalance.toLocaleString()} in ${selectedStock}. Please deposit more first.`,
        variant: "destructive",
      });
      return;
    }

    const success = await createInvestment({
      tier: selectedTier.label,
      asset: selectedStock,
      assetType: "stock",
      amount,
      apr: selectedTier.apr,
      period,
    });

    if (success) {
      toast({
        title: "Stock Investment Created!",
        description: `Your ${selectedTier.label} investment of $${amount.toLocaleString()} in ${selectedStock} has been created successfully!`,
      });
      onOpenChange(false);
      resetModal();
    } else {
      toast({
        title: "Investment Failed",
        description: "Unable to create stock investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetModal = () => {
    setStep(1);
    setWalletCopied(false);
    setTransactionHash("");
    setHasSelectedPeriod(false);
  };

  const getMaxStep = () => (needsDeposit ? 6 : 5);

  const getStockPrice = (symbol: string) =>
    stockPrices.find((s) => s.symbol === symbol);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            New Stock Investment
          </DialogTitle>
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
          {/* Step 1: KYC check or Stock selection */}
          {step === 1 && !isKYCVerified && (
            <div className="space-y-4">
              <h3 className="font-semibold">KYC Verification Required</h3>
              <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Complete KYC First
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You must complete KYC verification before making stock investments.
                      Go to Settings → KYC Verification to get started.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === 1 && isKYCVerified && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Stock to Invest In</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STOCK_LIST.map((stock) => {
                  const priceData = getStockPrice(stock.id);
                  return (
                    <div
                      key={stock.id}
                      className={`cursor-pointer transition-all rounded-lg ${
                        selectedStock === stock.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedStock(stock.id)}
                    >
                      <StockCard
                        symbol={stock.id}
                        name={stock.name}
                        price={priceData?.price || 0}
                        change={priceData?.change || 0}
                        changePercent={priceData?.changePercent || 0}
                        showInvestButton={false}
                        compact
                      />
                    </div>
                  );
                })}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How it works:</strong> Select a stock, choose your tier and investment amount.
                  Your returns are based on the tier's fixed APR rate. Stock prices are shown for reference.
                  Payments are made via cryptocurrency (BTC, ETH, or SOL).
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Select Tier */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                Select Investment Tier for {selectedStock}
              </h3>
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

          {/* Step 3: Enter Amount */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                Enter Investment Amount for {selectedStock}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Amount (USD)</Label>
                  <span className="text-sm text-muted-foreground">
                    Available in {selectedStock}: ${stockBalance.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={selectedTier.min}
                  max={stockBalance > 0 ? stockBalance : undefined}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Minimum: ${selectedTier.min.toLocaleString()}</span>
                  <span>
                    {stockBalance > 0
                      ? `Maximum: $${stockBalance.toLocaleString()}`
                      : "Deposit needed"}
                  </span>
                </div>
                {needsDeposit && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Deposit Required:</strong> You need $
                      {(amount - stockBalance).toLocaleString()} more for this {selectedStock} investment.
                      You'll be guided through the crypto deposit process next.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Deposit (if needed) */}
          {step === 4 && needsDeposit && (
            <div className="space-y-6">
              <h3 className="font-semibold">Deposit via Cryptocurrency</h3>
              <p className="text-sm text-muted-foreground">
                To invest ${amount.toLocaleString()} in {selectedStock}, send crypto payment to one of the addresses below.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {DEPOSIT_ASSETS.map((a) => (
                  <Card
                    key={a.id}
                    className={`p-3 cursor-pointer text-center transition-all ${
                      depositAsset === a.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setDepositAsset(a.id);
                      setWalletCopied(false);
                    }}
                  >
                    <a.icon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{a.name}</span>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-4 mb-4">
                  {selectedDepositAsset && (
                    <selectedDepositAsset.icon className="h-8 w-8" />
                  )}
                  <div>
                    <h4 className="font-semibold">
                      Send ${(amount - stockBalance).toLocaleString()} in {depositAsset}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Payment for {selectedStock} stock investment
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-sm font-mono break-all flex-1">
                        {selectedDepositAsset?.walletAddress}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyWalletAddress}
                        className="shrink-0"
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
                        <li>• Send exactly ${(amount - stockBalance).toLocaleString()} worth of {depositAsset}</li>
                        <li>• This funds your {selectedStock} stock investment account</li>
                        <li>• Admin verification typically takes 1-24 hours</li>
                        <li>• Once verified, your stock investment will be activated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4 (no deposit) or Step 5 (with deposit): Period selection + Summary */}
          {((step === 4 && !needsDeposit) || (step === 5 && needsDeposit)) && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Choose your earning cycle</h3>
                <FixedDurationSelector
                  value={period}
                  onChange={(value) => {
                    setPeriod(value);
                    setHasSelectedPeriod(true);
                  }}
                  options={[7, 14, 30, 60]}
                  label="Choose your earning cycle"
                  showSelected={hasSelectedPeriod}
                />
              </div>

              <Card className="p-6 bg-muted/50">
                <h4 className="font-semibold mb-4">Stock Investment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium">{selectedStock}</span>
                  </div>
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

          {/* Step 5 (no deposit) = Confirm, Step 6 (with deposit) = Submit deposit */}
          {step === 5 && !needsDeposit && null}
          {step === 6 && needsDeposit && (
            <div className="space-y-6">
              <h3 className="font-semibold">Complete Deposit Request</h3>
              <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold mb-4">Deposit Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit Amount:</span>
                    <span className="font-mono font-medium">
                      ${(amount - stockBalance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">For Stock:</span>
                    <span className="font-medium">{selectedStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Amount:</span>
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
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => {
              if (step === 1 && !isKYCVerified) {
                toast({
                  title: "KYC Required",
                  description: "Complete KYC verification first.",
                  variant: "destructive",
                });
                return;
              }
              const maxStep = getMaxStep();
              if (step < maxStep) {
                setStep(step + 1);
              } else {
                if (needsDeposit) {
                  handleDepositSubmit();
                } else {
                  handleConfirm();
                }
              }
            }}
            disabled={
              (step === 1 && !isKYCVerified) ||
              (step === 4 && needsDeposit && !walletCopied) ||
              (step === 3 && amount < selectedTier.min)
            }
          >
            {step === 1 && !isKYCVerified
              ? "Complete KYC First"
              : step === getMaxStep()
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
