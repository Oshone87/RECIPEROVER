import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Receipt {
  referenceId?: string;
  type?: string;
  asset?: string;
  amount?: number;
  network?: string;
  senderAddress?: string;
  recipientAddress?: string;
  createdAt?: string | Date;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transaction?: {
    id: string;
    type: string;
    asset: string;
    amount: number;
    status: string;
    date: string;
    receipt?: Receipt;
  } | null;
}

export function TransactionDetailsModal({
  open,
  onOpenChange,
  transaction,
}: Props) {
  const r = transaction?.receipt;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Reference ID</div>
            <div className="font-mono text-sm">{r?.referenceId || "—"}</div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Type</div>
            <div className="capitalize">{transaction?.type}</div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Asset</div>
            <div className="font-mono">{transaction?.asset}</div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="font-mono">
              ${transaction?.amount?.toLocaleString?.()}
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge className="capitalize">{transaction?.status}</Badge>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-mono text-sm">
              {new Date(transaction?.date || "").toLocaleString?.()}
            </div>
          </div>
          <hr className="my-2" />
          <div className="space-y-2">
            <div className="text-sm font-semibold">Transaction Details</div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">Network</div>
              <div className="font-mono text-sm">
                {r?.network || transaction?.asset}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Sender Address
              </div>
              <div className="font-mono text-xs break-all max-w-full sm:max-w-[60%] sm:text-right">
                {r?.senderAddress || "—"}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Recipient Address
              </div>
              <div className="font-mono text-xs break-all max-w-full sm:max-w-[60%] sm:text-right">
                {r?.recipientAddress || "—"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
