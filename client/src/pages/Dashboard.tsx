import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoChart } from "@/components/CryptoChart";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInvestment } from "@/contexts/InvestmentContext";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const {
    balance,
    investments,
    transactions,
    getTotalInvested,
    getTotalEarnings,
    getActiveInvestments,
    getAvailableBalance,
  } = useInvestment();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<
    "BTC" | "ETH" | "USDT" | "ADA" | "SOL"
  >("BTC");
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

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
  const activeInvestmentList = getActiveInvestments();
  const totalEarnings = getTotalEarnings();

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
                <p className="text-xs sm:text-sm opacity-90">Available</p>
                <p
                  className="text-lg sm:text-2xl font-mono"
                  data-testid="text-available-balance"
                >
                  ${availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm opacity-90">
                  Active Investments
                </p>
                <p
                  className="text-lg sm:text-2xl font-mono"
                  data-testid="text-active-investments"
                >
                  {activeInvestmentList.length}
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
                  if (availableBalance <= 0) {
                    toast({
                      title: "No funds available",
                      description:
                        "Please deposit funds first before making investments.",
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
                onClick={() => setWithdrawalModalOpen(true)}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Live Market Chart
                  </h2>
                  <Tabs
                    value={selectedAsset}
                    onValueChange={(v) =>
                      setSelectedAsset(
                        v as "BTC" | "ETH" | "USDT" | "ADA" | "SOL"
                      )
                    }
                  >
                    <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                      <TabsTrigger
                        value="BTC"
                        data-testid="tab-btc"
                        className="text-xs sm:text-sm"
                      >
                        BTC
                      </TabsTrigger>
                      <TabsTrigger
                        value="ETH"
                        data-testid="tab-eth"
                        className="text-xs sm:text-sm"
                      >
                        ETH
                      </TabsTrigger>
                      <TabsTrigger
                        value="USDT"
                        data-testid="tab-usdt"
                        className="text-xs sm:text-sm"
                      >
                        USDT
                      </TabsTrigger>
                      <TabsTrigger
                        value="ADA"
                        data-testid="tab-ada"
                        className="text-xs sm:text-sm"
                      >
                        ADA
                      </TabsTrigger>
                      <TabsTrigger
                        value="SOL"
                        data-testid="tab-sol"
                        className="text-xs sm:text-sm"
                      >
                        SOL
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CryptoChart asset={selectedAsset} height={300} />
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4">
                  Active Investments
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {activeInvestmentList.length > 0 ? (
                    activeInvestmentList.map((inv) => {
                      const daysLeft = Math.ceil(
                        (new Date(inv.endDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={inv.id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">
                                {inv.tier} - {inv.asset}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ${inv.amount.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-chart-2">
                              +${inv.earned.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{Math.max(0, daysLeft)} days left</span>
                              <span>{inv.progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${Math.min(100, inv.progress)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No active investments yet</p>
                      <p className="text-sm">
                        Create your first investment to get started
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Earned
                    </span>
                    <span className="font-mono font-semibold text-chart-2">
                      +${totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg. APR
                    </span>
                    <span className="font-mono font-semibold">7.5%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
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
