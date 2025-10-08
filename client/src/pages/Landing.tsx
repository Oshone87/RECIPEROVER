import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TierCard } from "@/components/TierCard";
import { LiveTradingChart } from "@/components/LiveTradingChart";
import { HowItWorks } from "@/components/HowItWorks";
import { InvestmentModal } from "@/components/InvestmentModal";
import { InvestmentTicker } from "@/components/InvestmentTicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TIERS = [
  {
    tier: "Bronze",
    minimum: 1000,
    apr: 24,
    features: [
      "24% APR (~6.58% daily growth)",
      "BTC, ETH, USDC support",
      "30-365 day investment terms",
      "Compound daily growth system",
      "Real-time portfolio tracking",
      "Email support & notifications",
      "Ideal for steady, reliable growth",
    ],
  },
  {
    tier: "Silver",
    minimum: 5000,
    apr: 30,
    features: [
      "30% APR (~8.22% daily growth)",
      "All Bronze tier benefits",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Lower transaction fees",
      "Faster earnings accumulation",
      "Perfect for accelerated growth",
    ],
    highlighted: true,
  },
  {
    tier: "Gold",
    minimum: 10000,
    apr: 36,
    features: [
      "36% APR (~9.86% daily growth)",
      "All Silver tier benefits",
      "Dedicated account manager",
      "Custom investment terms available",
      "VIP support & priority processing",
      "Maximum daily compound returns",
      "Elite tier for serious investors",
    ],
  },
];

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/signup");
    }
  };

  const handleTierSelect = () => {
    if (isAuthenticated) {
      setModalOpen(true);
    } else {
      setLocation("/signup");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative min-h-[85vh] sm:h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Beautiful crypto-themed gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          {/* Animated gradient overlay for crypto feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-pulse"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 py-8 sm:py-0">
          <Badge
            className="mb-2 sm:mb-4 bg-white/10 text-white border-white/20"
            variant="secondary"
          >
            <Users className="h-3 w-3 mr-1" />
            <span className="text-xs sm:text-sm">
              Trusted by 50,000+ investors
            </span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Invest Smarter in
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Cryptocurrency
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4 sm:px-0">
            Earn up to 36% APR on your crypto investments with our secure,
            tier-based investment platform
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button
              size="lg"
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section
        id="investment-tiers"
        className="py-12 sm:py-16 lg:py-20 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Investment Tiers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Choose the plan that fits your investment goals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {TIERS.map((tier) => (
              <TierCard key={tier.tier} {...tier} onSelect={handleTierSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* Live Investment Ticker */}
      <InvestmentTicker />

      {/* Tier Logic Explanation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Understanding Our Investment Tiers
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto px-4 sm:px-0">
              How each tier works and what the numbers mean for your investment
              timeline
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Daily Growth Rates */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">
                  How Daily Growth Works
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium text-blue-600">
                    Bronze Tier (24% APR)
                  </span>
                  <span className="text-sm bg-gray-50 dark:bg-gray-900/20 px-2 py-1 rounded">
                    ~0.066% daily
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="font-medium text-purple-600">
                    Silver Tier (30% APR)
                  </span>
                  <span className="text-sm bg-gray-50 dark:bg-gray-900/20 px-2 py-1 rounded">
                    ~0.082% daily
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-amber-600">
                    Gold Tier (36% APR)
                  </span>
                  <span className="text-sm bg-gray-50 dark:bg-gray-900/20 px-2 py-1 rounded">
                    ~0.099% daily
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Each tier has a different annual percentage rate (APR) which
                  determines how much your investment grows each day through
                  compound interest.
                </p>
              </div>
            </div>

            {/* Time Period Impact */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Time Period Examples</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    30-Day Investment ($1,000):
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bronze (24% APR):</span>
                      <span className="font-medium">$2,973.97</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Silver (30% APR):</span>
                      <span className="font-medium">$3,465.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gold (36% APR):</span>
                      <span className="font-medium">$3,958.90</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    365-Day Investment ($1,000):
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bronze (24% APR):</span>
                      <span className="font-medium">$25,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Silver (30% APR):</span>
                      <span className="font-medium">$31,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gold (36% APR):</span>
                      <span className="font-medium">$37,000.00</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Investment returns are calculated based on your selected
                  tier's annual percentage rate, distributed proportionally
                  across your chosen investment period. Higher tiers offer
                  enhanced returns with additional portfolio management
                  benefits.
                </p>
              </div>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Key Investment Concepts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Compound Interest</h4>
                <p className="text-sm text-muted-foreground">
                  Your earnings are reinvested daily, creating growth on both
                  your initial investment and accumulated returns
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">APR vs Daily Rate</h4>
                <p className="text-sm text-muted-foreground">
                  Annual Percentage Rate divided by 365 days gives you the daily
                  growth rate for your investment
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Choose What Fits</h4>
                <p className="text-sm text-muted-foreground">
                  Each tier serves different investment goals and risk
                  tolerances. Consider your financial situation and timeline
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Live Market Analysis
            </h2>
            <p className="text-muted-foreground px-4 sm:px-0">
              Real-time cryptocurrency charts powered by TradingView
            </p>
          </div>
          <LiveTradingChart />
        </div>
      </section>

      <HowItWorks />

      <Footer />

      <InvestmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
