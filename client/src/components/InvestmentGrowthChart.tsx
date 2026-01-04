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
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Investment Growth Tracker</h2>
        <p className="text-sm text-muted-foreground">
          Monitor your investment performance in real-time
        </p>
      </div>

      {/* Investment cards with Daily Progress Tracker only */}
      <div className="space-y-4">
        {getDisplayInvestments().map((investment) => {
          return (
            <DailyProgressTracker 
              key={investment.id}
              investment={investment}
              compact={false}
            />
          );
        })}
      </div>
    </div>
  );
}
