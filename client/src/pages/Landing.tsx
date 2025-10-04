import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TierCard } from "@/components/TierCard";
import { CryptoChart } from "@/components/CryptoChart";
import { HowItWorks } from "@/components/HowItWorks";
import { InvestmentModal } from "@/components/InvestmentModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users } from "lucide-react";
import heroImage from "@assets/generated_images/Crypto_investment_hero_background_a66bd1f6.png";

const TIERS = [
  {
    tier: "Silver",
    minimum: 1000,
    apr: 6,
    features: [
      "BTC, ETH, USDC support",
      "30-365 day terms",
      "Email support",
      "Real-time tracking",
    ],
  },
  {
    tier: "Gold",
    minimum: 5000,
    apr: 8,
    features: [
      "All Silver features",
      "Priority support",
      "Advanced analytics",
      "Lower fees",
    ],
    highlighted: true,
  },
  {
    tier: "Platinum",
    minimum: 10000,
    apr: 10,
    features: [
      "All Gold features",
      "Dedicated account manager",
      "Custom investment terms",
      "VIP status",
    ],
  },
];

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative min-h-[85vh] sm:h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 py-8 sm:py-0">
          <Badge className="mb-2 sm:mb-4" variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            <span className="text-xs sm:text-sm">
              Trusted by 50,000+ investors
            </span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Invest Smarter in Crypto
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Earn up to 10% APR on your crypto investments with our secure,
            tier-based investment platform
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              data-testid="button-get-started"
              className="w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md w-full sm:w-auto"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-background">
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
              <TierCard
                key={tier.tier}
                {...tier}
                onSelect={() => setModalOpen(true)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Live Market Preview
            </h2>
            <p className="text-muted-foreground px-4 sm:px-0">
              Real-time cryptocurrency charts
            </p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 lg:p-6 border">
            <CryptoChart height={300} showCarousel={true} />
          </div>
        </div>
      </section>

      <HowItWorks />

      <Footer />

      <InvestmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
