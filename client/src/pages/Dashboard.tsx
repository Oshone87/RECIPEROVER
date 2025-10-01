import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoChart } from "@/components/CryptoChart";
import { InvestmentModal } from "@/components/InvestmentModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const MOCK_INVESTMENTS = [
  { id: 1, tier: "Gold", asset: "BTC", amount: 5000, earned: 120, daysLeft: 45, progress: 50 },
  { id: 2, tier: "Silver", asset: "ETH", amount: 1500, earned: 35, daysLeft: 15, progress: 83 },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: "2025-03-15", type: "Deposit", asset: "USDC", amount: 5000, status: "Completed" },
  { id: 2, date: "2025-03-10", type: "Investment", asset: "BTC", amount: 5000, status: "Active" },
  { id: 3, date: "2025-03-05", type: "Deposit", asset: "USDC", amount: 1500, status: "Completed" },
  { id: 4, date: "2025-03-01", type: "Investment", asset: "ETH", amount: 1500, status: "Active" },
];

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "USDT">("BTC");
  const [modalOpen, setModalOpen] = useState(false);

  const totalBalance = 6655;
  const availableBalance = 0;
  const activeInvestments = 2;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="space-y-1">
              <p className="text-sm opacity-90">Total Balance</p>
              <p className="text-4xl font-bold font-mono" data-testid="text-total-balance">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-6">
              <div className="space-y-1">
                <p className="text-sm opacity-90">Available</p>
                <p className="text-2xl font-mono" data-testid="text-available-balance">
                  ${availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-90">Active Investments</p>
                <p className="text-2xl font-mono" data-testid="text-active-investments">
                  {activeInvestments}
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setModalOpen(true)}
              data-testid="button-new-investment"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Investment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Live Market Chart</h2>
                  <Tabs value={selectedAsset} onValueChange={(v) => setSelectedAsset(v as "BTC" | "ETH" | "USDT")}>
                    <TabsList>
                      <TabsTrigger value="BTC" data-testid="tab-btc">BTC</TabsTrigger>
                      <TabsTrigger value="ETH" data-testid="tab-eth">ETH</TabsTrigger>
                      <TabsTrigger value="USDT" data-testid="tab-usdt">USDT</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CryptoChart asset={selectedAsset} height={500} />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Active Investments</h2>
                <div className="space-y-4">
                  {MOCK_INVESTMENTS.map((inv) => (
                    <div key={inv.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{inv.tier} - {inv.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            ${inv.amount.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-chart-2">
                          +${inv.earned}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{inv.daysLeft} days left</span>
                          <span>{inv.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${inv.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Earned</span>
                    <span className="font-mono font-semibold text-chart-2">+$155</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. APR</span>
                    <span className="font-mono font-semibold">7.5%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-xl font-bold mb-6">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Asset</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b hover-elevate" data-testid={`row-transaction-${tx.id}`}>
                      <td className="py-3 px-4 text-sm">{tx.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {tx.type === "Deposit" ? (
                            <ArrowDownRight className="h-4 w-4 text-chart-2" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">{tx.asset}</td>
                      <td className="py-3 px-4 text-sm font-mono text-right">
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={tx.status === "Completed" ? "secondary" : "default"}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
      <InvestmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
