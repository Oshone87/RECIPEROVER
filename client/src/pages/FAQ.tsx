import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQ() {
  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button in the navigation bar, fill in your details, and verify your email address. After email verification, you'll need to complete our KYC process to start investing."
        },
        {
          question: "What is KYC and why is it required?",
          answer: "KYC (Know Your Customer) is a regulatory requirement that helps us verify your identity and comply with financial regulations. You'll need to provide a government-issued ID and proof of address. This process typically takes 24-48 hours for verification."
        },
        {
          question: "What is the minimum investment amount?",
          answer: "Our Bronze tier starts at just $100, making crypto investing accessible to everyone. You can upgrade to higher tiers (Silver, Gold, Platinum, Diamond) for better returns and additional benefits."
        }
      ]
    },
    {
      title: "Investment Plans",
      items: [
        {
          question: "What are the different investment tiers?",
          answer: "We offer 5 investment tiers: Bronze ($100-$999), Silver ($1,000-$4,999), Gold ($5,000-$9,999), Platinum ($10,000-$24,999), and Diamond ($25,000+). Each tier offers increasing daily returns and benefits."
        },
        {
          question: "How are returns calculated?",
          answer: "Returns are calculated daily based on your tier and deposited directly into your account. Bronze earns 2.5% daily, Silver 3.5%, Gold 4.5%, Platinum 5.5%, and Diamond 7% daily. Returns are compounded if you choose to reinvest."
        },
        {
          question: "Can I invest in multiple tiers?",
          answer: "Your tier is automatically determined by your total account balance. As you deposit more funds, you'll automatically upgrade to higher tiers with better returns. All your investments are combined into your current tier."
        },
        {
          question: "How long is the investment period?",
          answer: "Our investment plans are flexible. You can withdraw your funds at any time after the initial 7-day lock-in period. However, we recommend staying invested longer to maximize your compound returns."
        }
      ]
    },
    {
      title: "Deposits & Withdrawals",
      items: [
        {
          question: "What cryptocurrencies do you accept?",
          answer: "We currently accept Bitcoin (BTC), Ethereum (ETH), USDT (Tether), and USDC. All deposits are converted to USD equivalent for your account balance calculations."
        },
        {
          question: "How long do deposits take to process?",
          answer: "Cryptocurrency deposits are credited to your account after network confirmations. Bitcoin requires 3 confirmations (~30 minutes), Ethereum requires 12 confirmations (~3 minutes), and stablecoins require 6 confirmations."
        },
        {
          question: "What are the withdrawal limits?",
          answer: "Minimum withdrawal is $50. Maximum daily withdrawal limits vary by tier: Bronze $1,000, Silver $5,000, Gold $10,000, Platinum $25,000, and Diamond unlimited. Withdrawals are processed within 24 hours."
        },
        {
          question: "Are there any fees?",
          answer: "We charge no deposit fees. Withdrawal fees are minimal: 1% for amounts under $1,000, 0.5% for $1,000-$10,000, and 0.25% for amounts over $10,000. Network transaction fees apply separately."
        }
      ]
    },
    {
      title: "Security & Safety",
      items: [
        {
          question: "How secure is my investment?",
          answer: "We employ bank-level security including 256-bit encryption, cold storage for 95% of funds, multi-signature wallets, and regular third-party security audits. Your funds are protected by industry-leading security protocols."
        },
        {
          question: "Is my personal information safe?",
          answer: "Absolutely. We comply with GDPR and international data protection standards. Your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent."
        },
        {
          question: "What happens if I lose access to my account?",
          answer: "Use the 'Forgot Password' feature to reset your password via email. For additional security concerns, contact our support team with your registered email and we'll verify your identity through our KYC records."
        },
        {
          question: "Do you offer two-factor authentication?",
          answer: "Yes, we strongly recommend enabling 2FA for added security. You can set this up in your account settings using Google Authenticator or Authy."
        }
      ]
    },
    {
      title: "Returns & Profits",
      items: [
        {
          question: "When will I see returns on my investment?",
          answer: "Returns are credited daily to your account at 00:00 UTC. You can view your daily earnings in the dashboard under 'Transaction History.' Returns start accruing 24 hours after your deposit is confirmed."
        },
        {
          question: "Can I reinvest my profits?",
          answer: "Yes! You can manually reinvest profits by making a new deposit, or enable auto-compounding in your account settings to automatically reinvest daily returns for exponential growth."
        },
        {
          question: "Are returns guaranteed?",
          answer: "While we have a strong track record, cryptocurrency markets are volatile and past performance doesn't guarantee future returns. Our experienced trading team works to maximize returns while managing risk, but all investments carry inherent market risks."
        }
      ]
    },
    {
      title: "Account Management",
      items: [
        {
          question: "Can I have multiple accounts?",
          answer: "No, per our terms of service and regulatory requirements, each user is allowed one account. Multiple accounts may result in suspension and forfeiture of funds."
        },
        {
          question: "How do I upgrade my tier?",
          answer: "Tiers upgrade automatically when your account balance reaches the next tier threshold. Simply deposit more funds to reach the next tier level and enjoy increased daily returns."
        },
        {
          question: "Can I refer friends?",
          answer: "Yes! Our referral program offers bonuses for both you and your referred friends. You'll earn a percentage of their deposits as a referral bonus. Check your dashboard for your unique referral link."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our crypto investment platform
          </p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="text-2xl">{category.title}</CardTitle>
                <CardDescription>
                  Common questions about {category.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
            <CardDescription>
              Our support team is here to help you 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our dedicated support team is ready to assist you with any questions or concerns.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Contact Support
            </a>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
