import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InvestmentGrowthChart } from "@/components/InvestmentGrowthChart";
import { InvestmentModal } from "@/components/InvestmentModal";
import { WithdrawalModal } from "@/components/WithdrawalModal";
import { DepositModal } from "@/components/DepositModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestment } from "@/contexts/InvestmentContext";
import { useToast } from "@/hooks/use-toast";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { TbCurrencySolana } from "react-icons/tb";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const {
    balance,
    assetBalances,
    investments,
    transactions,
    getTotalInvested,
    getTotalEarnings,
    getActiveInvestments,
    getAvailableBalance,
    getAssetBalance,
  } = useInvestment();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Get user's KYC status
  const getUserKycStatus = () => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );
    const currentUser = registeredUsers.find(
      (u: any) => u.email === user?.email
    );
    return {
      isVerified: currentUser?.isVerified || false,
      kycStatus: currentUser?.kycStatus || "not_submitted",
      kycSubmitted: currentUser?.kycSubmitted || false,
    };
  };

  const kycInfo = getUserKycStatus();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null; // Prevent flash before redirect
  }

  const totalBalance = balance + getTotalInvested() + getTotalEarnings();
  const availableBalance = getAvailableBalance();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-between sm:items-center sm:gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm opacity-90">Total Balance</p>
              <p
                className="text-3xl sm:text-4xl font-bold font-mono"
                data-testid="text-total-balance"
              >
                ${totalBalance.toLocaleString()}
              </p>
            </div>

            <div className="flex justify-center sm:justify-start gap-4 sm:gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm opacity-90">
                  Available Balance
                </p>
                <p
                  className="text-lg sm:text-2xl font-mono"
                  data-testid="text-available-balance"
                >
                  ${availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm opacity-90">Total Invested</p>
                <p
                  className="text-lg sm:text-2xl font-mono"
                  data-testid="text-total-invested"
                >
                  ${getTotalInvested().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                size="lg"
                variant="default"
                onClick={() => setDepositModalOpen(true)}
                data-testid="button-deposit"
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Deposit</span>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  const totalAssetBalance =
                    getAssetBalance("BTC") +
                    getAssetBalance("ETH") +
                    getAssetBalance("SOL");
                  if (totalAssetBalance <= 0) {
                    toast({
                      title: "No crypto assets available",
                      description:
                        "Please deposit cryptocurrency assets (BTC, ETH, or SOL) first before making investments.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setModalOpen(true);
                }}
                data-testid="button-new-investment"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">New Investment</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (!kycInfo.isVerified) {
                    toast({
                      title: "KYC Verification Required",
                      description:
                        "You must complete and have your KYC verification approved before making withdrawals.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setWithdrawalModalOpen(true);
                }}
                disabled={availableBalance <= 0}
                data-testid="button-withdraw"
                className="w-full sm:w-auto"
              >
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Withdraw</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Investment Growth Chart - Full Width */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <InvestmentGrowthChart />
          </Card>

          {/* Transaction History */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              Transaction History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Asset
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b hover-elevate"
                        data-testid={`row-transaction-${tx.id}`}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                            <span className="text-xs sm:text-sm">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-mono">
                          {tx.asset}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-mono text-right">
                          ${tx.amount.toLocaleString()}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Badge
                            variant={
                              tx.status === "Active"
                                ? "default"
                                : tx.status === "Approved" ||
                                  tx.status === "Completed"
                                ? "secondary"
                                : tx.status === "Failed"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No transactions yet. Make your first investment to see
                        transaction history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
      <InvestmentModal open={modalOpen} onOpenChange={setModalOpen} />
      <WithdrawalModal
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
        availableBalance={availableBalance}
      />
      <DepositModal
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
      />
    </div>
  );
}
