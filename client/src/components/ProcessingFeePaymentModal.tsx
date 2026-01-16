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
import { Badge } from "@/components/ui/badge";
import { SiBitcoin } from "react-icons/si";
import { Copy, CheckCircle, AlertTriangle, Shield, Info } from "lucide-react";
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
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const { toast } = useToast();

  const PROCESSING_FEE_AMOUNT = 2000;
  const COMPANY_BTC_ADDRESS = "bc1qmydk975vecj4z9t649sx8l38nyttx06jnndcqu";

  const copyAddress = () => {
    navigator.clipboard.writeText(COMPANY_BTC_ADDRESS);
    setAddressCopied(true);
    toast({
      title: "Address Copied!",
      description: "Bitcoin address copied to clipboard",
    });
    setTimeout(() => setAddressCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your wallet address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.submitDeposit({
        amount: PROCESSING_FEE_AMOUNT,
        asset: "BTC",
        transactionHash: "",
        walletAddress: walletAddress.trim(),
        paymentMethod: "crypto",
        notes: "PROCESSING FEE PAYMENT - Withdrawal activation fee",
      });

      toast({
        title: "Processing Fee Submitted Successfully",
        description: "Your processing fee payment has been submitted for review. You will be notified once the payment is approved, and your withdrawal privileges will be activated within 24 hours.",
        duration: 8000,
      });

      setWalletAddress("");
      onOpenChange(false);
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
                  <li>Copy our Bitcoin address below</li>
                  <li>Send exactly $2,000 USD equivalent in Bitcoin (BTC) to the address</li>
                  <li>Enter your sending wallet address in the form below</li>
                  <li>Submit for administrative verification</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Company BTC Address Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Send Bitcoin To This Address
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-2 border-orange-300 dark:border-orange-700">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SiBitcoin className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-medium text-muted-foreground">Bitcoin (BTC) Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs sm:text-sm font-mono bg-white dark:bg-gray-900 p-3 rounded border break-all">
                    {COMPANY_BTC_ADDRESS}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="shrink-0"
                  >
                    {addressCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  <strong>Important:</strong> Only send Bitcoin (BTC) to this address. Sending other cryptocurrencies may result in permanent loss of funds.
                </p>
              </div>
            </Card>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address" className="text-sm font-medium">
                Your BTC Wallet Address (Sender)
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
                The wallet address from which you will send the BTC payment
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <p className="font-medium mb-1">Important Notice:</p>
              <ul className="space-y-0.5">
                <li>• Send exactly $2,000 USD worth of BTC to the address above</li>
                <li>• Only Bitcoin (BTC) payments are accepted</li>
                <li>• Double-check the wallet address before sending</li>
                <li>• Verification typically completes within 24 hours</li>
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
              disabled={isSubmitting || !walletAddress.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Processing Fee Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
