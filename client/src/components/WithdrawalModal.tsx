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
import { DollarSign, AlertTriangle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

const WITHDRAWAL_ASSETS = [
  { id: "BTC", name: "Bitcoin", icon: SiBitcoin, fee: "0.0005 BTC" },
  { id: "ETH", name: "Ethereum", icon: SiEthereum, fee: "0.01 ETH" },
  { id: "SOL", name: "Solana", icon: TbCurrencySolana, fee: "0.001 SOL" },
];

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance?: number;
  onSuccess?: () => void;
}

export function WithdrawalModal({
  open,
  onOpenChange,
  availableBalance = 0,
  onSuccess,
}: WithdrawalModalProps) {
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const selectedAsset = WITHDRAWAL_ASSETS.find((a) => a.id === asset);
  const numAmount = parseFloat(amount) || 0;
  const maxWithdrawal = availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (numAmount > maxWithdrawal) {
      toast({
        title: "Insufficient balance",
        description: `Maximum withdrawal amount is $${maxWithdrawal.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (numAmount < 50) {
      toast({
        title: "Minimum withdrawal",
        description: "Minimum withdrawal amount is $50",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.submitWithdrawal({
        amount: numAmount,
        asset,
        walletAddress,
      });

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for $${numAmount.toLocaleString()} in ${asset} has been submitted. It will be processed by an administrator within 24 hours.`,
      });

      onOpenChange(false);
      setAmount("");
      setWalletAddress("");

      // Call onSuccess to refresh dashboard data
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description:
          error.response?.data?.message ||
          "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] mx-4 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Asset</Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger
                  data-testid="select-withdrawal-asset"
                  className="h-12"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WITHDRAWAL_ASSETS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <a.icon className="h-4 w-4" />
                        <span className="text-sm">{a.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <Label
                  htmlFor="withdrawal-amount"
                  className="text-sm font-medium"
                >
                  Amount (USD)
                </Label>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Available: ${maxWithdrawal.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={maxWithdrawal}
                  step="0.01"
                  data-testid="input-withdrawal-amount"
                  className="h-12 pr-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
                  onClick={() => setAmount(maxWithdrawal.toString())}
                  data-testid="button-max-withdrawal"
                >
                  MAX
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-address" className="text-sm font-medium">
                Wallet Address
              </Label>
              <Input
                id="wallet-address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${asset} wallet address`}
                data-testid="input-wallet-address"
                className="h-12"
              />
            </div>
          </div>

          <Card className="p-3 bg-muted/50">
            <h4 className="font-medium mb-2 text-sm">Withdrawal Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-mono">${numAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="font-mono">{selectedAsset?.fee}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="font-medium">You'll Receive:</span>
                <span className="font-mono font-medium">
                  ~${Math.max(0, numAmount - 5).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-0.5">
                <li>• Admin approval required (processed within 24 hours)</li>
                <li>• Double-check your wallet address</li>
                <li>• Minimum withdrawal: $50</li>
                <li>• Network fees apply and are deducted</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-withdrawal"
            >
              <span className="text-sm">Cancel</span>
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={
                isSubmitting || !walletAddress || !amount || numAmount <= 0
              }
              data-testid="button-confirm-withdrawal"
            >
              <span className="text-sm">
                {isSubmitting ? "Processing..." : "Withdraw"}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
