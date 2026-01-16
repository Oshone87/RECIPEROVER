import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Shield, CheckCircle } from "lucide-react";

interface ProcessingFeeExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceedToPayment: () => void;
}

export function ProcessingFeeExplanationModal({
  open,
  onOpenChange,
  onProceedToPayment,
}: ProcessingFeeExplanationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Withdrawal Processing Fee Required
          </DialogTitle>
          <DialogDescription>
            Important information regarding your withdrawal request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Explanation */}
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-base">
                  Processing Fee Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To process your withdrawal request and release your funds, a one-time 
                  processing fee of <strong className="text-foreground">$2,000 USD</strong> is required. 
                  This fee covers blockchain transaction costs, regulatory compliance requirements, 
                  and secure fund transfer operations.
                </p>
              </div>
            </div>
          </Card>

          {/* Why This Fee */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              What This Fee Covers:
            </h4>
            <ul className="space-y-2 ml-6 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Blockchain network transaction fees and gas costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>KYC/AML verification and regulatory compliance processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Secure multi-signature wallet operations and authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Priority processing and expedited fund release</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>24/7 transaction monitoring and fraud prevention systems</span>
              </li>
            </ul>
          </div>

          {/* Payment Process */}
          <Card className="p-4 border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <h4 className="font-semibold text-sm mb-3">Payment Process:</h4>
            <ol className="space-y-2 ml-6 text-sm text-muted-foreground list-decimal">
              <li>Click "Pay Processing Fee" to proceed to the payment portal</li>
              <li>Submit your fee payment in Bitcoin (BTC) only</li>
              <li>Administrative review and approval (within 24 hours)</li>
              <li>Once approved, you may proceed with your withdrawal request</li>
            </ol>
          </Card>

          {/* Important Notice */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Please Note:</strong> The processing fee 
              is a one-time payment required to activate withdrawal capabilities for your account. 
              This fee must be paid in Bitcoin (BTC) and will be processed within 24 hours of submission.
              Your withdrawal privileges will be enabled immediately upon administrative approval.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => {
              onOpenChange(false);
              onProceedToPayment();
            }}
          >
            Pay Processing Fee ($2,000)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
