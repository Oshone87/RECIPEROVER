import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: November 1, 2025
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              By accessing and using CryptoInvest's platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </CardContent>
        </Card>

        <ScrollArea className="h-[600px] mt-6">
          <div className="space-y-6 pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>"Platform"</strong> refers to the CryptoInvest website, mobile applications, and all related services.
                </p>
                <p className="text-muted-foreground">
                  <strong>"User"</strong> refers to any individual or entity that creates an account and uses our platform.
                </p>
                <p className="text-muted-foreground">
                  <strong>"Investment"</strong> refers to any cryptocurrency deposit made into our investment tiers.
                </p>
                <p className="text-muted-foreground">
                  <strong>"Returns"</strong> refers to the daily percentage gains credited to user accounts based on their investment tier.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>To use our platform, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be a resident of or located in any jurisdiction where cryptocurrency investment services are prohibited</li>
                  <li>Complete our KYC (Know Your Customer) verification process</li>
                  <li>Not be on any sanctions lists or be a politically exposed person without disclosure</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. Account Registration and Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security and confidentiality of your login credentials</li>
                  <li>Notify us immediately of any unauthorized access or security breaches</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Maintain only one account per person - multiple accounts are strictly prohibited</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. Investment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <h4 className="font-semibold text-foreground">4.1 Investment Tiers</h4>
                <p>We offer five investment tiers with varying minimum deposits and daily return rates. Tier classification is based on your total account balance and is automatically updated.</p>
                
                <h4 className="font-semibold text-foreground mt-4">4.2 Returns and Payments</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Daily returns are calculated at 00:00 UTC and credited within 24 hours</li>
                  <li>Returns are estimates and may vary based on market conditions</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>We reserve the right to adjust return rates with 7 days notice</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">4.3 Lock-in Period</h4>
                <p>All investments are subject to a 7-day lock-in period from the date of deposit. Withdrawals requested during this period may be subject to penalties or rejection.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Deposits and Withdrawals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <h4 className="font-semibold text-foreground">5.1 Deposits</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Minimum deposit: $100 USD equivalent in cryptocurrency</li>
                  <li>Accepted cryptocurrencies: BTC, ETH, USDT, USDC</li>
                  <li>Deposits require network confirmations before being credited</li>
                  <li>We are not responsible for deposits sent to incorrect addresses</li>
                </ul>

                <h4 className="font-semibold text-foreground mt-4">5.2 Withdrawals</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Minimum withdrawal: $50 USD equivalent</li>
                  <li>Daily withdrawal limits apply based on tier level</li>
                  <li>Withdrawals are processed within 24 hours of request</li>
                  <li>Withdrawal fees range from 0.25% to 1% depending on amount</li>
                  <li>We reserve the right to request additional verification for large withdrawals</li>
                  <li>Suspected fraudulent activity may result in frozen withdrawals pending investigation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. KYC and AML Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We are committed to preventing money laundering and terrorist financing. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide valid government-issued identification</li>
                  <li>Provide proof of address (utility bill, bank statement, etc.)</li>
                  <li>Submit to additional verification if required by regulatory authorities</li>
                  <li>Confirm the source of your investment funds if requested</li>
                  <li>Accept that we may reject or freeze accounts that fail KYC verification</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">7. Risk Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Cryptocurrency investments involve significant risk. You acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cryptocurrency markets are highly volatile and prices can fluctuate dramatically</li>
                  <li>You may lose some or all of your invested capital</li>
                  <li>Past performance is not indicative of future results</li>
                  <li>Returns are not guaranteed and may be lower than projected</li>
                  <li>Regulatory changes may impact the availability or profitability of services</li>
                  <li>Technical issues, security breaches, or market conditions may affect returns</li>
                  <li>You should only invest funds you can afford to lose</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">8. Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Users are strictly prohibited from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Using the platform for money laundering or terrorist financing</li>
                  <li>Creating multiple accounts or using false identity information</li>
                  <li>Attempting to manipulate or exploit the platform's systems</li>
                  <li>Using automated bots or scripts without authorization</li>
                  <li>Sharing account credentials with third parties</li>
                  <li>Engaging in any fraudulent or deceptive practices</li>
                  <li>Depositing funds from illegal sources</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">9. Fees and Charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>No deposit fees are charged by CryptoInvest</li>
                  <li>Network transaction fees (gas fees) are the responsibility of the user</li>
                 
                  <li>Early withdrawal penalties may apply during lock-in periods</li>
                  <li>We reserve the right to modify fees with 30 days advance notice</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">10. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>All content on the CryptoInvest platform, including but not limited to text, graphics, logos, icons, images, audio clips, and software, is the property of CryptoInvest and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works without express written permission.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">11. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Your privacy is important to us. We collect, use, and protect your personal information in accordance with our Privacy Policy and applicable data protection laws including GDPR. By using our platform, you consent to our data practices as outlined in our Privacy Policy.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">12. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>To the maximum extent permitted by law, CryptoInvest shall not be liable for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or use</li>
                  <li>Service interruptions or delays</li>
                  <li>Cryptocurrency price volatility or market losses</li>
                  <li>Security breaches resulting from user negligence</li>
                  <li>Third-party actions or services</li>
                  <li>Regulatory changes affecting service availability</li>
                </ul>
                <p className="mt-4">Our total liability shall not exceed the amount of fees paid by you in the 12 months preceding the claim.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">13. Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>You agree to indemnify, defend, and hold harmless CryptoInvest, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses arising from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your violation of these Terms of Service</li>
                  <li>Your violation of any laws or regulations</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your use or misuse of the platform</li>
                  <li>Any fraudulent or illegal activity on your account</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">14. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We reserve the right to suspend or terminate your account at any time if:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You violate these Terms of Service</li>
                  <li>You engage in fraudulent or illegal activity</li>
                  <li>You fail KYC/AML verification</li>
                  <li>Required by law or regulatory authorities</li>
                  <li>Your account remains inactive for more than 12 months</li>
                </ul>
                <p className="mt-4">Upon termination, you may withdraw your remaining balance minus any applicable fees or penalties, subject to verification requirements.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">15. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <h4 className="font-semibold text-foreground">15.1 Informal Resolution</h4>
                <p>In the event of any dispute, you agree to first contact us to attempt to resolve the issue informally through our support team.</p>
                
                <h4 className="font-semibold text-foreground mt-4">15.2 Arbitration</h4>
                <p>If informal resolution fails, disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration will take place in New York, NY, USA.</p>
                
                <h4 className="font-semibold text-foreground mt-4">15.3 Class Action Waiver</h4>
                <p>You agree to resolve disputes individually and waive any right to participate in class actions or representative proceedings.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">16. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>These Terms of Service shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">17. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of the platform after changes constitutes acceptance of the modified terms. Material changes will be communicated via email.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">18. Severability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">19. Force Majeure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>CryptoInvest shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">20. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>For questions about these Terms of Service, please contact us:</p>
                <div className="mt-4 space-y-1">
                  <p><strong>Email:</strong> cryptoinvest.helpdesk@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  By using CryptoInvest, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </main>
      <Footer />
    </div>
  );
}
