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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TbCurrencySolana } from "react-icons/tb";
import {
  DollarSign,
  Copy,
  CheckCircle,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

const DEPOSIT_ASSETS = [
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

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DepositModal({
  open,
  onOpenChange,
  onSuccess,
}: DepositModalProps) {
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const selectedAsset = DEPOSIT_ASSETS.find((a) => a.id === asset);
  const numAmount = parseFloat(amount) || 0;

  const copyWalletAddress = () => {
    if (selectedAsset) {
      navigator.clipboard.writeText(selectedAsset.walletAddress);
      setWalletCopied(true);
      toast({
        title: "Wallet Address Copied!",
        description: "Send your funds to this address to make a deposit.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    if (numAmount < 100) {
      toast({
        title: "Minimum deposit",
        description: "Minimum deposit amount is $100",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.submitDeposit({
        amount: numAmount,
        asset,
        transactionHash: transactionHash || undefined,
        senderAddress: senderAddress || undefined,
      });

      toast({
        title: "Deposit Request Submitted",
        description: `Your deposit request for $${numAmount.toLocaleString()} in ${asset} has been submitted. Funds will be added to your account once verified by admin.`,
      });

      onOpenChange(false);
      setStep(1);
      setAmount("");
      setTransactionHash("");
      setSenderAddress("");
      setWalletCopied(false);

      // Call onSuccess to refresh dashboard data
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description:
          error.response?.data?.message ||
          "Failed to submit deposit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setAmount("");
    setTransactionHash("");
    setWalletCopied(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetModal();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Deposit Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Asset & Amount</h3>

              <div className="space-y-2">
                <Label>Asset</Label>
                <Select value={asset} onValueChange={setAsset}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPOSIT_ASSETS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          <a.icon className="h-4 w-4" />
                          {a.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount (USD)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="100"
                  step="0.01"
                  data-testid="input-deposit-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum deposit: $100
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Send {selectedAsset?.name}</h3>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-4 mb-4">
                  {selectedAsset && <selectedAsset.icon className="h-8 w-8" />}
                  <div>
                    <h4 className="font-semibold">
                      {selectedAsset?.name} Wallet Address
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Send exactly ${numAmount.toLocaleString()} worth of{" "}
                      {asset}
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
                </div>
              </Card>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">Confirm Your Deposit</h3>

              <div className="space-y-2">
                <Label htmlFor="transaction-hash">
                  Transaction Hash (Optional)
                </Label>
                <Input
                  id="transaction-hash"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Enter transaction hash if available"
                />
                <p className="text-sm text-muted-foreground">
                  This helps our admin verify your payment faster
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender-address">
                  Your Sending Wallet Address
                </Label>
                <Input
                  id="sender-address"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder={`Paste your ${asset} wallet address`}
                />
                <p className="text-sm text-muted-foreground">
                  We’ll include this on your receipt for reference.
                </p>
              </div>

              <Card className="p-4 bg-muted/50">
                <h4 className="font-medium mb-3">Deposit Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-mono">
                      ${numAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="font-mono">{asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Address:</span>
                    <span className="font-mono truncate max-w-[60%] text-right">
                      {senderAddress || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">
                      Funds will be added after verification
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="space-y-1">
                    <li>
                      • Deposits require admin verification before funds are
                      available
                    </li>
                    <li>• Verification typically takes 1-24 hours</li>
                    <li>
                      • You can only make investments after deposit approval
                    </li>
                    <li>• Keep your transaction hash for faster processing</li>
                  </ul>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                onOpenChange(false);
              }
            }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={() => {
              if (step < 3) {
                if (step === 1 && (!amount || numAmount < 100)) {
                  toast({
                    title: "Invalid amount",
                    description: "Please enter a valid amount of at least $100",
                    variant: "destructive",
                  });
                  return;
                }
                setStep(step + 1);
              } else {
                handleSubmit(new Event("submit") as any);
              }
            }}
            disabled={isSubmitting || (step === 2 && !walletCopied)}
          >
            {step === 3
              ? isSubmitting
                ? "Submitting..."
                : "Submit Deposit Request"
              : step === 2
              ? "I've Copied the Address"
              : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
