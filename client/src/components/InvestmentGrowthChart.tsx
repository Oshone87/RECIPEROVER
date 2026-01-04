import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { useInvestment } from "@/contexts/InvestmentContext";
import { DailyProgressTracker } from "@/components/DailyProgressTracker";

interface DailyGrowth {
  date: string;
  amount: number;
  dailyEarning: number;
  percentage: number;
}

export function InvestmentGrowthChart() {
  const { getActiveInvestments } = useInvestment();
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(
    null
  );
  const [showAllInvestments, setShowAllInvestments] = useState(true);
  const activeInvestments = getActiveInvestments();

  // Generate growth data for each investment
  const generateGrowthData = (investment: any): DailyGrowth[] => {
    if (
      !investment ||
      !investment.startDate ||
      !investment.apr ||
      !investment.amount
    ) {
      return [];
    }

    const startDate = new Date(investment.startDate);
    const endDate = new Date(investment.endDate || startDate);
    const today = new Date();
    const lastDate = today < endDate ? today : endDate;
    const data: DailyGrowth[] = [];

    // Linear, non-compounding daily earnings to match the slider estimate
    const dailyRate = (investment.apr || 0) / 365; // no /100
    const principal = investment.amount || 0;

    for (
      let d = new Date(startDate);
      d <= lastDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Earnings grow linearly by principal * dailyRate each day
      const daysElapsed = Math.max(
        0,
        Math.round((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const earned = principal * dailyRate * daysElapsed;
      const dailyEarning = principal * dailyRate;
      const amount = principal + earned;

      data.push({
        date: d.toISOString().split("T")[0],
        amount,
        dailyEarning,
        percentage: (earned / principal) * 100,
      });
    }

    return data.slice(-30); // Last 30 days
  };

  const getDisplayInvestments = () => {
    const validInvestments = activeInvestments.filter(
      (inv) => inv && inv.id && inv.amount && inv.tier && inv.asset
    );

    if (showAllInvestments) return validInvestments;
    if (selectedInvestment) {
      return validInvestments.filter((inv) => inv.id === selectedInvestment);
    }
    return validInvestments.slice(0, 1); // Show first investment if none selected
  };

  const getTotalGrowth = () => {
    return activeInvestments.reduce(
      (total, inv) => total + (inv.earned || 0),
      0
    );
  };

  const getTotalPercentage = () => {
    const totalInvested = activeInvestments.reduce(
      (total, inv) => total + inv.amount,
      0
    );
    const totalEarned = getTotalGrowth();
    return totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;
  };

  if (activeInvestments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              No Active Investments
            </h3>
            <p className="text-muted-foreground">
              Create your first investment to start tracking your growth here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Investment Growth Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your investment performance in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeInvestments.length > 1 && (
            <>
              <Button
                variant={showAllInvestments ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllInvestments(!showAllInvestments)}
                className="flex items-center gap-2"
              >
                {showAllInvestments ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {showAllInvestments ? "Show All" : "Individual"}
              </Button>

              {!showAllInvestments && (
                <select
                  value={selectedInvestment || ""}
                  onChange={(e) =>
                    setSelectedInvestment(e.target.value || null)
                  }
                  className="px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Select Investment</option>
                  {activeInvestments.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.tier} - {inv.asset} (${inv.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Growth</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +${getTotalGrowth().toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{getTotalPercentage().toFixed(2)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Active Investments
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {activeInvestments.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Investment cards */}
      <div className="space-y-4">
        {getDisplayInvestments().map((investment) => {
          const growthData = generateGrowthData(investment);
          const latestGrowth = growthData[growthData.length - 1];
          const daysLeft = Math.max(
            0,
            Math.ceil(
              (new Date(investment.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );

          return (
            <Card key={investment.id} className="overflow-hidden">
              {/* Investment header */}
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-semibold">
                        {investment.tier}
                      </Badge>
                      <span className="text-lg font-bold">
                        {investment.asset}
                      </span>
                      <Badge variant="secondary">{investment.apr}% APR</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Initial: ${investment.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {daysLeft} days remaining
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +${(investment.earned || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Earnings
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Progress Tracker - replaces the graph */}
              <div className="p-4 sm:p-6">
                <DailyProgressTracker 
                  investment={investment}
                  compact={false}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
