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
    features: ["BTC, ETH, USDC support", "30-365 day terms", "Email support", "Real-time tracking"],
  },
  {
    tier: "Gold",
    minimum: 5000,
    apr: 8,
    features: ["All Silver features", "Priority support", "Advanced analytics", "Lower fees"],
    highlighted: true,
  },
  {
    tier: "Platinum",
    minimum: 10000,
    apr: 10,
    features: ["All Gold features", "Dedicated account manager", "Custom investment terms", "VIP status"],
  },
];

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
          <Badge className="mb-4" variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            Trusted by 50,000+ investors
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Invest Smarter in Crypto
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn up to 10% APR on your crypto investments with our secure, tier-based investment platform
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setModalOpen(true)} data-testid="button-get-started">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="backdrop-blur-md" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Investment Tiers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your investment goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Market Preview</h2>
            <p className="text-muted-foreground">BTC/USD candlestick chart</p>
          </div>
          <div className="bg-card rounded-xl p-6 border">
            <CryptoChart asset="BTC" height={400} />
          </div>
        </div>
      </section>

      <HowItWorks />

      <Footer />
      
      <InvestmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
