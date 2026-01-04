import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, Target } from "lucide-react";

interface Investment {
  id: string;
  tier: string;
  asset: string;
  amount: number;
  apr: number;
  period: number;
  startDate: string;
  endDate: string;
  earned: number;
  status: string;
  progress?: number;
}

interface DailyProgressTrackerProps {
  investment: Investment;
  compact?: boolean;
}

export function DailyProgressTracker({
  investment,
  compact = false,
}: DailyProgressTrackerProps) {
  // Calculate days elapsed and remaining
  const startDate = new Date(investment.startDate);
  const endDate = new Date(investment.endDate);
  const today = new Date();
  
  const totalDays = investment.period;
  const elapsed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysCompleted = Math.min(elapsed, totalDays);
  const daysRemaining = Math.max(0, totalDays - daysCompleted);
  
  // Calculate daily earnings
  // APR is stored as 24, 30, 36 which represents 2400%, 3000%, 3600%
  // So we multiply by 100 to get the actual percentage value
  const dailyRateDollars = (investment.amount * investment.apr) / 365;
  const dailyRatePercentage = investment.apr / 365; // Daily percentage rate
  const todaysEarning = investment.status === "active" ? dailyRateDollars : 0;
  const totalGrowth = investment.earned || 0;
  
  // Progress percentage
  const progressPercentage = (daysCompleted / totalDays) * 100;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Compact Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Day {daysCompleted}/{totalDays}
            </span>
            <span className="text-primary font-semibold">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
            <p className="text-sm font-bold text-green-600">{dailyRatePercentage.toFixed(2)}%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className="text-sm font-bold text-blue-600">${todaysEarning.toFixed(2)}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-sm font-bold text-purple-600">${totalGrowth.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold">Daily Progress Tracker</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {investment.tier} • {investment.asset} • {totalDays} days
          </p>
        </div>
        <Badge variant={investment.status === "active" ? "default" : "secondary"} className="capitalize">
          {investment.status}
        </Badge>
      </div>

      {/* Main Progress Section */}
      <div className="space-y-6">
        {/* Progress Bar with Day Counter */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold">
                Day {daysCompleted}/{totalDays}
              </span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-primary">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative h-4 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transition-all duration-500 relative overflow-hidden rounded-full"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
          
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>Started: {startDate.toLocaleDateString()}</span>
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>

        {/* Earnings Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Daily Rate */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                  Daily Rate
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
                  {dailyRatePercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Today's Earning */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Today's Earning
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ${todaysEarning.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Growth */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Total Growth
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ${totalGrowth.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}

export default DailyProgressTracker;
