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
    const startDate = new Date(investment.startDate);
    const currentDate = new Date();
    const data: DailyGrowth[] = [];

    const dailyRate = investment.apr / 365 / 100;
    let currentAmount = investment.amount;

    for (
      let d = new Date(startDate);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dailyEarning = currentAmount * dailyRate;
      currentAmount += dailyEarning;

      data.push({
        date: d.toISOString().split("T")[0],
        amount: currentAmount,
        dailyEarning,
        percentage:
          ((currentAmount - investment.amount) / investment.amount) * 100,
      });
    }

    return data.slice(-30); // Last 30 days
  };

  const getDisplayInvestments = () => {
    if (showAllInvestments) return activeInvestments;
    if (selectedInvestment) {
      return activeInvestments.filter((inv) => inv.id === selectedInvestment);
    }
    return activeInvestments.slice(0, 1); // Show first investment if none selected
  };

  const getTotalGrowth = () => {
    return activeInvestments.reduce((total, inv) => total + inv.earned, 0);
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
                      +${investment.earned.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Earnings
                    </p>
                  </div>
                </div>
              </div>

              {/* Growth visualization */}
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {investment.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, investment.progress)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Growth line chart */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      30-Day Growth Trend
                    </h4>
                    <div className="h-32 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 400 100"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {/* Grid lines */}
                        <defs>
                          <linearGradient
                            id={`gradient-${investment.id}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgb(59, 130, 246)"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgb(59, 130, 246)"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                        </defs>

                        {/* Horizontal grid lines */}
                        {[20, 40, 60, 80].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="400"
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Vertical grid lines */}
                        {[100, 200, 300].map((x) => (
                          <line
                            key={x}
                            x1={x}
                            y1="0"
                            x2={x}
                            y2="100"
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Generate path for growth line */}
                        {(() => {
                          const chartData = growthData.slice(-20);
                          const maxPercentage = Math.max(
                            ...chartData.map((d) => d.percentage)
                          );
                          const minPercentage = Math.min(
                            ...chartData.map((d) => d.percentage)
                          );
                          const range = maxPercentage - minPercentage || 1;

                          const points = chartData
                            .map((day, index) => {
                              const x =
                                (index / (chartData.length - 1)) * 380 + 10;
                              const normalizedY =
                                (day.percentage - minPercentage) / range;
                              const y = 85 - normalizedY * 70;
                              return `${x},${y}`;
                            })
                            .join(" ");

                          const pathData = chartData
                            .map((day, index) => {
                              const x =
                                (index / (chartData.length - 1)) * 380 + 10;
                              const normalizedY =
                                (day.percentage - minPercentage) / range;
                              const y = 85 - normalizedY * 70;
                              return index === 0
                                ? `M ${x},${y}`
                                : `L ${x},${y}`;
                            })
                            .join(" ");

                          const areaPath = `${pathData} L ${
                            ((chartData.length - 1) / (chartData.length - 1)) *
                              380 +
                            10
                          },85 L 10,85 Z`;

                          return (
                            <>
                              {/* Area under the curve */}
                              <path
                                d={areaPath}
                                fill={`url(#gradient-${investment.id})`}
                                opacity="0.6"
                              />

                              {/* Main growth line */}
                              <path
                                d={pathData}
                                fill="none"
                                stroke="rgb(59, 130, 246)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-sm"
                              />

                              {/* Data points */}
                              {chartData.map((day, index) => {
                                const x =
                                  (index / (chartData.length - 1)) * 380 + 10;
                                const normalizedY =
                                  (day.percentage - minPercentage) / range;
                                const y = 85 - normalizedY * 70;

                                return (
                                  <g key={day.date}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="4"
                                      fill="white"
                                      stroke="rgb(59, 130, 246)"
                                      strokeWidth="2"
                                      className="hover:r-6 transition-all cursor-pointer"
                                    >
                                      <title>
                                        {new Date(
                                          day.date
                                        ).toLocaleDateString()}
                                        : +{day.percentage.toFixed(2)}%{"\n"}
                                        Amount: ${day.amount.toFixed(2)}
                                        {"\n"}Daily Earning: +$
                                        {day.dailyEarning.toFixed(2)}
                                      </title>
                                    </circle>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>

                      {/* Chart labels */}
                      <div className="absolute inset-x-0 -bottom-1 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {growthData.length > 0
                            ? new Date(growthData[0]?.date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : ""}
                        </span>
                        <span>Growth Over Time</span>
                        <span>
                          {growthData.length > 0
                            ? new Date(
                                growthData[growthData.length - 1]?.date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                      </div>

                      {/* Y-axis label */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
                        Growth %
                      </div>
                    </div>

                    {/* Daily stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">Daily Rate</p>
                        <p className="font-semibold">
                          {(investment.apr / 365).toFixed(3)}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">Today's Earning</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +${latestGrowth?.dailyEarning.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">Total Growth</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          +{latestGrowth?.percentage.toFixed(2) || "0.00"}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="font-semibold">
                          $
                          {(
                            investment.amount + investment.earned
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
